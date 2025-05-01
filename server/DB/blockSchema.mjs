import mongoose from "mongoose";

const blockSchema = new mongoose.Schema({
  index: Number,
  previousHash: String,
  merkleRoot: String,
  timestamp: Number,
  target: String,
  nonce: Number,
  transactionCount: Number,
  transactionDetails: [Object],
  hash: String
});

export default mongoose.model("Block", blockSchema);
