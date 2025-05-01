import Block from './Block.mjs';
import { verifyTransaction, computeMerkleRoot, getTargetByDifficulty } from './helpers.mjs';  

class Blockchain {
  constructor(difficulty = 4, miningReward = 100) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = difficulty;
    this.miningReward = miningReward;
    this.pendingTransactions = [];
  }

  createGenesisBlock() {
    const genesisTx = [{ from: "genesis", to: "network", amount: 0 }];
    const merkleRoot = computeMerkleRoot(genesisTx);
    return new Block(1, "0".repeat(64), merkleRoot, Date.now(), "0000ffff", 0, 1, genesisTx);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addTransaction(transaction) {
    if (!transaction.from || !transaction.to || typeof transaction.amount !== "number") {
      throw new Error("Invalid transaction format");
    }

    const transactionData = JSON.stringify({ from: transaction.from, to: transaction.to, amount: transaction.amount });

    if (transaction.from !== "network") {
      if (!verifyTransaction(transactionData, transaction.signature, transaction.publicKey)) {
        throw new Error("Invalid transaction signature");
      }
    }

    console.log(`Transaction added: ${JSON.stringify(transaction)}`);
    this.pendingTransactions.push(transaction);
  }

  minePendingTransactions(minerAddress) {
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
    const newBlock = new Block(
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

  getBalanceOfAddress(address) {
    let balance = 0;
    for (const block of this.chain) {
      for (const tx of block.transactionDetails) {
        if (tx.from === address) balance -= tx.amount;
        if (tx.to === address) balance += tx.amount;
      }
    }
    return balance;
  }
}

export default Blockchain;
