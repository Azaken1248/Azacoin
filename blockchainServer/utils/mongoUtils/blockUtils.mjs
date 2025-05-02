import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let blocks;

try {
  await client.connect();
  const db = client.db("azaChainDB");
  blocks = db.collection("blocks");
  console.log("Connected to MongoDB for blocks");
} catch (err) {
  console.error("Failed to connect to MongoDB for blocks:", err);
}

export async function saveBlock(block) {
  if (!block) {
    console.error("Tried to save undefined block");
    return;
  }

  try {
    const result = await blocks.insertOne(block);
    console.log("Block saved with ID:", result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error("Error saving block:", error);
  }
}

export async function getAllBlocks() {
  try {
    return await blocks.find().toArray();
  } catch (err) {
    console.error("Error fetching all blocks:", err);
    throw err;
  }
}

export async function getBlockByHash(hash) {
  try {
    return await blocks.findOne({ hash });
  } catch (err) {
    console.error("Error fetching block by hash:", err);
    throw err;
  }
}

export async function getLatestBlock() {
  try {
    return await blocks.findOne().sort({ index: -1 });
  } catch (err) {
    console.error("Error fetching latest block:", err.message);
    throw err;
  }
}

export async function clearBlockchain() {
  try {
    const result = await blocks.deleteMany({});
    console.log(`Cleared ${result.deletedCount} blocks`);
    return result.deletedCount;
  } catch (err) {
    console.error("Error clearing blockchain:", err);
    throw err;
  }
}
