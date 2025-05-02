import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chainRoutes from "./routes/chainRouter.mjs";

dotenv.config();
const app = express();
const PORT = process.env.CHAIN_PORT || 3002;

app.use(cors());
app.use(express.json());
app.use("/chain", chainRoutes);

app.get("/", (_req, res) => {
  res.send("AzaChain API is running");  
});

app.listen(PORT, () => {
  console.log(`Blockchain Server running on port ${PORT}`);
});
