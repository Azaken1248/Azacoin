import Block from './Block.mjs';
import { verifyTransaction, computeMerkleRoot, getTargetByDifficulty } from './helpers.mjs';  
import { saveBlock, getAllBlocks } from '../mongoUtils/blockUtils.mjs'; 

class Blockchain {
  constructor(difficulty = 2, miningReward = 100) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = difficulty;
    this.blockTime = 30000;
    this.adjustmentInterval = 10;
    this.miningReward = miningReward;
    this.pendingTransactions = [];
  }

  createGenesisBlock() {
    const genesisTx = [{ from: "network", to: "network", amount: 0 }];
    const merkleRoot = computeMerkleRoot(genesisTx);
    return new Block(
      1,                     
      1,                     
      "0".repeat(64),         
      merkleRoot,             
      Date.now(),             
      "00ffff",              
      0,                     
      genesisTx.length,      
      genesisTx               
    );
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
    const { from, to, amount, publicKey, signature } = transaction;
    const message = JSON.stringify({ from, to, amount });

    
    const isValid = verifyTransaction(message, signature, publicKey);
  
    if (!isValid) {
      throw new Error("Invalid transaction signature");
    }
  
    this.pendingTransactions.push(transaction);
    console.log("Transaction verified and added");
  }

  async minePendingTransactions(minerAddress) {
    console.log(`Mining started... Difficulty: ${this.difficulty}`);
    console.log(`Pending transactions: ${JSON.stringify(this.pendingTransactions)}`);
  
    const rewardTx = {
      from: "network",
      to: minerAddress,
      amount: this.miningReward
    };
  
    console.log(`Adding mining reward for miner: ${minerAddress}`);
    this.pendingTransactions.push(rewardTx);
  
    const merkleRoot = computeMerkleRoot(this.pendingTransactions);
    const newBlockIndex = this.chain.length + 1;
  
    const newBlock = new Block(
      newBlockIndex, 
      1,
      this.getLatestBlock().hash,
      merkleRoot,
      Date.now(),
      getTargetByDifficulty(this.difficulty),
      0,
      this.pendingTransactions.length,
      [...this.pendingTransactions]
    );
  
    console.log(`Mining block with transactions: ${JSON.stringify(this.pendingTransactions)}`);
  
    newBlock.mine(this.difficulty);
  
    console.log(`Block mined! Block Hash: ${newBlock.hash}`);
    this.chain.push(newBlock);
    await saveBlock(newBlock);
    this.syncChainWithMongo();

    this.adjustDifficulty();
  
    console.log("Mining completed. Resetting pending transactions.");
    this.pendingTransactions = [];
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const block = this.chain[i];
      const prevBlock = this.chain[i - 1];

      if (block.hash !== block.calculateHash()) return false;
      if (block.previousHash !== prevBlock.hash) return false;
    }
    return true;
  }

  normalizeKey(key) {
    return key.replace(/(\r\n|\n|\r|\s)/gm, '');
  }
  
  getBalanceOfAddress(address) {
    let balance = 0;
    const normalizedAddress = this.normalizeKey(address);
  
    for (const block of this.chain) {
      for (const tx of block.transactionDetails) {
        const from = this.normalizeKey(tx.from || '');
        const to = this.normalizeKey(tx.to || '');
  
        //console.log("Comparing to:", normalizedAddress);
        //console.log("From:", from);
        //console.log("To:", to);
        //console.log("check1: ", to == normalizedAddress);
        //console.log("check2: ", from == normalizedAddress);
  
        if (from === normalizedAddress) balance -= tx.amount;
        if (to === normalizedAddress) balance += tx.amount;
      }
    }
    return balance;
  }
  
  

  adjustDifficulty() {
    const latestBlock = this.getLatestBlock();
    const prevAdjustmentBlock = this.chain[this.chain.length - this.adjustmentInterval];
    if (!prevAdjustmentBlock) return;
  
    const actualTime = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    const expectedTime = this.blockTime * this.adjustmentInterval;
  
    if (actualTime < expectedTime / 2) {
      this.difficulty += 1;
      console.log("Increasing difficulty to", this.difficulty);
    } else if (actualTime > expectedTime * 2 && this.difficulty > 1) {
      this.difficulty -= 1;
      console.log("Decreasing difficulty to", this.difficulty);
    } else {
      console.log("Difficulty remains at", this.difficulty);
    }
  }

  getChain() {
    return this.chain;
  }

  getLatestBlockData() {
    return this.getLatestBlock();
  }

  getPendingTransactions() {
    return this.pendingTransactions;
  }

  getBlockByIndex(index) {
    return this.chain.find(block => block.index === index);
  }

  async syncChainWithMongo() {
    const blocks = await getAllBlocks();  
    this.chain = blocks;              
  }

  async saveBlockToDB(block) {
    await saveBlock(block);  
  }
}

export default Blockchain;
