import express from "express";
import {
  submitMinedBlock,
  addTransactionHandler,
  mineBlockHandler,
  getBalanceHandler,
  getAllBlocksHandler,
  getLatestBlockHandler,
  getChainHandler,
  getPendingTransactionsHandler,
} from "../controllers/chainController.mjs";

const router = express.Router();
router.post("/submit", submitMinedBlock);
router.post("/transactions", addTransactionHandler);
router.post("/mine", mineBlockHandler);
router.get("/balance/:username", getBalanceHandler);
router.get("/", getAllBlocksHandler);
router.get("/latest", getLatestBlockHandler);
router.get("/", getChainHandler);
router.get("/transactions/pending", getPendingTransactionsHandler);

export default router;
