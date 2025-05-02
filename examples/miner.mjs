import axios from 'axios';
import crypto from 'crypto';
import { getHashCode, hashDigest } from '../blockchainServer/dependencies/azahash.mjs';

const target = "00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
const blockTime = 30000;

let pendingTransactions = [];

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function hexToBigInt(hex) {
  return BigInt('0x' + hex);
}

function computeMerkleRoot(transactions) {
    if (!transactions || transactions.length === 0) return '';
  
    let hashes = transactions.map(tx => getHashCode(hashDigest(JSON.stringify(tx))));
  
    while (hashes.length > 1) {
      if (hashes.length % 2 !== 0) {
        hashes.push(hashes[hashes.length - 1]); 
      }
  
      const newLevel = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const combined = hashes[i] + hashes[i + 1];
        const newHash = getHashCode(hashDigest(combined));
        newLevel.push(newHash);
      }
      hashes = newLevel;
    }
  
    return hashes[0]; 
  }
  

class Block {
  constructor(index,version, previousHash, merkleRoot, timestamp, target, nonce, transactionCounter, transactionDetails) {
    this.index = index;
    this.version = version;
    this.previousHash = previousHash;
    this.merkleRoot = merkleRoot;
    this.timestamp = timestamp || Date.now();
    this.target = target || "00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
    this.nonce = nonce || 0;
    this.transactionCounter = transactionCounter;
    this.transactionDetails = transactionDetails;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    const data = this.index + this.version + this.previousHash + this.merkleRoot + this.timestamp + this.target + this.nonce + this.transactionCounter + JSON.stringify(this.transactionDetails);
    
    return sha256(data)
    //return getHashCode(hashDigest(data));
  }

  mine() {
    const targetInt = hexToBigInt(this.target);
    while (hexToBigInt(this.hash) >= targetInt) {
      this.nonce++;
      this.hash = this.calculateHash();
  
      if (this.nonce % 100000 === 0) {
        console.log(`Trying nonce ${this.nonce}... Current hash: ${this.hash}`);
      }
    }
    console.log(`Block mined! Hash: ${this.hash}`);
  }
  
}


async function mineBlock() {
  try {
    const latestBlockRes = await axios.get('http://localhost:3002/chain/latest');
    const latestBlock = latestBlockRes.data;

    const pendingTransactionsRes = await axios.get('http://localhost:3002/chain/transactions/pending');
    pendingTransactions = pendingTransactionsRes.data;

    const newBlock = new Block(
      latestBlock.index + 1,
      1,
      latestBlock.hash,
      computeMerkleRoot(pendingTransactions),
      Date.now(),
      target,
      0,
      0,
      pendingTransactions
    );

    console.log("Mining started...");
    newBlock.mine();

    await submitMinedBlock(newBlock);
  } catch (err) {
    console.error("Error while mining:", err);
  }
}

async function submitMinedBlock(block) {
  try {
    const response = await axios.post('http://localhost:3002/chain/submit', block);
    console.log(response.data);
  } catch (err) {
    console.error("Failed to submit mined block:", err);
  }
}

setInterval(() => {
  mineBlock();
}, blockTime);
