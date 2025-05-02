import { createUser, getAllUsers, getUserByUsername } from "../utils/mongoUtils/userUtils.mjs";
import { getKeys } from "../utils/blockchainUtils/helpers.mjs";
import { hashDigest, getHashCode } from "../dependencies/azahash.mjs";
import { authenticateJWT } from "../middleware/authMiddleware.mjs";

import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET; 

export async function createUserHandler(req, res) {
  const { username, password } = req.body;
  if (!password) return res.status(400).json({ error: "Password required" });

  try {
    const hashedPassword = getHashCode(hashDigest(password));
    const { publicKey, privateKey } = getKeys();

    const id = await createUser(username, hashedPassword, publicKey, privateKey);
    res.status(201).json({
      message: "User created",
      id,
      publicKey,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
}


export async function loginUserHandler(req, res) {
    const { username, password } = req.body;
    if (!password) return res.status(400).json({ error: "Password required" });
  
    try {
      const user = await getUserByUsername(username);
      if (!user) return res.status(404).json({ error: "User not found" });
  
      const inputHashed = getHashCode(hashDigest(password));
      if (inputHashed !== user.password) {
        return res.status(401).json({ error: "Incorrect password" });
      }
  
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  
      res.status(200).json({ message: "Login successful", token });
    } catch (err) {
      res.status(500).json({ error: "Failed to log in" });
    }
  }
  
  

  export const getUserHandler = async (req, res) => {
      try {
        const user = await getUserByUsername(req.params.username);
        
        if (!user) return res.status(404).json({ error: "User not found" });
  
        const { username, publicKey } = user;
        res.json({ username, publicKey });
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch user" });
      }
  }

  export async function getAllUsersHandler(_req, res) {
    try {
      const users = await getAllUsers();
      const sanitized = users.map(({ username, publicKey }) => ({ username, publicKey }));
      res.json(sanitized);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
  
