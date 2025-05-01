import Blockchain from "../utils/blockchainUtils/Blockchain.mjs";
import Block from "../utils/blockchainUtils/Block.mjs";  
import { saveBlock, getAllBlocks } from "../utils/mongoUtils/blockUtils.mjs";

const azaChain = new Blockchain();

async function loadBlockchainFromDB() {
  try {
    const savedBlocks = await getAllBlocks();

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
  } catch (err) {
    console.error("❌ Failed to load blockchain:", err);
  }
}

await loadBlockchainFromDB();

export async function addTransactionHandler(req, res) {
  const { from, to, amount, publicKey, signature } = req.body;
  try {
    azaChain.addTransaction({ from, to, amount, publicKey, signature });
    res.status(200).json({ message: "Transaction added" });
  } catch (err) {
    res.status(400).json({ error: "Invalid transaction" });
  }
}

export async function mineBlockHandler(req, res) {
  const { minerAddress } = req.body;
  try {
    const newBlock = azaChain.minePendingTransactions(minerAddress);
    await saveBlock(newBlock);
    res.status(200).json({ message: "Block mined", block: newBlock });
  } catch (err) {
    res.status(500).json({ error: "Failed to mine block" });
  }
}

export async function getBalanceHandler(req, res) {
  const { address } = req.params;
  try {
    const balance = azaChain.getBalanceOfAddress(address);
    res.json({ address, balance });
  } catch (err) {
    res.status(500).json({ error: "Failed to get balance" });
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
