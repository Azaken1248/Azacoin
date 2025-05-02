import Block from "../utils/blockchainUtils/Block.mjs";
import Blockchain from "../utils/blockchainUtils/Blockchain.mjs";
import { saveBlock, getAllBlocks } from "../utils/mongoUtils/blockUtils.mjs";
import { verifyTransaction } from "../utils/blockchainUtils/helpers.mjs";
import fs from "fs";
import path from "path";

const publicKeyPath = path.resolve("./public.pem");
let serverPublicKey;

try {
  const raw = fs.readFileSync(publicKeyPath, "utf8");
  serverPublicKey = raw
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\r?\n|\r/g, "");
  console.log("Server public key loaded for mining.");
} catch (err) {
  console.error("Failed to load public key from public.pem:", err);
}


const azaChain = new Blockchain();

async function loadBlockchainFromDB() {
  try {
    const savedBlocks = await getAllBlocks();

    if (savedBlocks.length === 0) {
      console.log("⛓️ No blocks in DB, starting with genesis block.");
      azaChain.chain = [azaChain.createGenesisBlock()];
      await saveBlock(azaChain.chain[0]);
    } else {
      savedBlocks.sort((a, b) => a.index - b.index);
      azaChain.chain = savedBlocks.map(block =>
        new Block(
          block.index,
          block.version,
          block.previousHash,
          block.merkleRoot,
          block.timestamp,
          block.target,
          block.nonce,
          block.transactionCounter,
          block.transactionDetails,
          block.hash
        )
      );
      console.log("Blockchain loaded from MongoDB");
    }
  } catch (err) {
    console.error("Failed to load blockchain:", err);
  }
}

await loadBlockchainFromDB();

export async function submitMinedBlock(req, res) {
  const block = req.body; 

  try {
    if (!block.hash || !block.previousHash) {
      return res.status(400).json({ error: "Invalid block data" });
    }

    const isValidBlock = azaChain.isChainValid(block);
    if (!isValidBlock) {
      return res.status(400).json({ error: "Invalid block hash or proof of work" });
    }

    const latestBlock = azaChain.getLatestBlock();
    if (block.previousHash !== latestBlock.hash) {
      return res.status(400).json({ error: "Previous hash does not match" });
    }

    await saveBlock(block);
    azaChain.chain.push(block); 
    res.status(200).json({ message: "Block successfully submitted", block });
  } catch (err) {
    console.error("Error submitting block:", err);
    res.status(500).json({ error: "Failed to submit block" });
  }
}

export async function addTransactionHandler(req, res) {
  const { from, to, amount, publicKey, signature } = req.body;

  try {
    const isValid = verifyTransaction({ from, to, amount }, signature, publicKey);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid transaction signature" });
    }

    const transaction = { from, to, amount, publicKey, signature };
    azaChain.addTransaction(transaction);
    res.status(200).json({ message: "Transaction added" });
  } catch (err) {
    console.error("Transaction error:", err);
    res.status(400).json({ error: "Invalid transaction" });
  }
}

export async function mineBlockHandler(_req, res) {
  try {
    const newBlock = await azaChain.minePendingTransactions(serverPublicKey); 
    console.log("⛏ Attempting to save block:", newBlock);
    await saveBlock(newBlock);
    res.status(200).json({ message: "Block mined", block: newBlock });
  } catch (err) {
    res.status(500).json({ error: "Failed to mine block" });
  }
}

export async function getBalanceHandler(req, res) {
  try {
    const username = req.params.username;

    const response = await fetch(`http://localhost:3001/user/${username}`);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: "User not found or server error" });
    }

    const { publicKey } = await response.json();

    const balance = azaChain.getBalanceOfAddress(publicKey);
    res.json({ username, address: publicKey, balance });
  } catch (err) {
    console.error("Failed to fetch balance:", err);
    res.status(500).json({ error: "Error fetching balance" });
  }
}



export async function getAllBlocksHandler(_req, res) {
  try {
    const blocks = await getAllBlocks();
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blocks" });
  }
}

export async function getLatestBlockHandler(_req, res) {
  try {
    const latestBlock = azaChain.getLatestBlockData();
    res.json(latestBlock);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch the latest block" });
  }
}

export async function getChainHandler(_req, res) {
  try {
    const chain = azaChain.getChain();
    res.json(chain);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blockchain" });
  }
}

export async function getPendingTransactionsHandler(_req, res) {
  try {
    const pendingTransactions = azaChain.getPendingTransactions();
    res.json(pendingTransactions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending transactions" });
  }
}
