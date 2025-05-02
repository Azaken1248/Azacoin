//import { hashDigest, getHashCode } from "../../dependencies/azahash.mjs";
import { hexToBigInt } from "./helpers.mjs";

import crypto from "crypto";

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
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

export default Block;
