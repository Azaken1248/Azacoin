import Blockchain from "../utils/blockchainUtils/Blockchain.mjs";
import Block from "../utils/blockchainUtils/Block.mjs";  
import { saveBlock, getAllBlocks } from "../utils/mongoUtils/blockUtils.mjs";
import { authenticateJWT } from "../middleware/authMiddleware.mjs";
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
  console.log("✅ Server public key loaded for mining.");
} catch (err) {
  console.error("❌ Failed to load public key from public.pem:", err);
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
            block.version,
            block.previousHash,
            block.merkleRoot,
            block.timestamp,
            block.target,
            block.nonce,
            block.transactionCounter,
            block.transactionDetails
          )
        );
        console.log("✅ Blockchain loaded from MongoDB");
      }
    } catch (err) {
      console.error("❌ Failed to load blockchain:", err);
    }
  }

await loadBlockchainFromDB();

export const addTransactionHandler = [
    authenticateJWT,
    async (req, res) => {
      const { to, amount, signature } = req.body;
      try {
        const user = await getUserByUsername(req.user.username);
        if (!user) return res.status(404).json({ error: "User not found" });
  
        const from = user.publicKey;
        azaChain.addTransaction({ from, to, amount, publicKey: from, signature });
  
        res.status(200).json({ message: "Transaction added" });
      } catch (err) {
        res.status(400).json({ error: "Invalid transaction" });
      }
    }
  ];

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
  

export const getBalanceHandler = [
    authenticateJWT,
    async (req, res) => {
      try {
        const user = await getUserByUsername(req.user.username);
        if (!user) return res.status(404).json({ error: "User not found" });
        console.log(user.publicKey);
        const balance = azaChain.getBalanceOfAddress(user.publicKey);
        res.json({ address: user.publicKey, balance });
      } catch (err) {
        res.status(500).json({ error: err });
      }
    }
  ];
  

export async function getAllBlocksHandler(_req, res) {
  try {
    const blocks = await getAllBlocks();
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch blocks" });
  }
}
