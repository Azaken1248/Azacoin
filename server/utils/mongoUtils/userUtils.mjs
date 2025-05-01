import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let users;

try {
  await client.connect();
  const db = client.db("azaChainDB");
  users = db.collection("users");
  console.log("✅ Connected to MongoDB for users");
} catch (err) {
  console.error("❌ Failed to connect to MongoDB for users:", err);
}

export async function createUser(username, password, publicKey, privateKey) {
  try {
    const user = { username,password, publicKey, privateKey };
    const result = await users.insertOne(user);
    console.log("✅ User created:", username);
    return result.insertedId;
  } catch (err) {
    console.error("❌ Error creating user:", err);
    throw err;
  }
}

export async function getUserByUsername(username) {
  try {
    return await users.findOne({ username });
  } catch (err) {
    console.error("❌ Error fetching user by username:", err);
    throw err;
  }
}

export async function getAllUsers() {
  try {
    return await users.find({}).toArray();
  } catch (err) {
    console.error("❌ Error fetching all users:", err);
    throw err;
  }
}

export async function updateUserKeys(username, newPublicKey, newPrivateKey) {
  try {
    const result = await users.updateOne(
      { username },
      { $set: { publicKey: newPublicKey, privateKey: newPrivateKey } }
    );
    console.log(`🔑 Updated keys for user: ${username}`);
    return result.modifiedCount > 0;
  } catch (err) {
    console.error("❌ Error updating user keys:", err);
    throw err;
  }
}

export async function deleteUser(username) {
  try {
    const result = await users.deleteOne({ username });
    console.log(`🗑️ Deleted user: ${username}`);
    return result.deletedCount > 0;
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    throw err;
  }
}
