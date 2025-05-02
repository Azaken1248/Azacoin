import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  publicKey: String,
  privateKey: String 
});

export default mongoose.model("User", userSchema);
