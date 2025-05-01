import express from "express";
import {
  addTransactionHandler,
  mineBlockHandler,
  getBalanceHandler,
  getAllBlocksHandler
} from "../controllers/chainController.mjs";

const router = express.Router();

router.post("/transaction", addTransactionHandler);
router.post("/mine", mineBlockHandler);
router.get("/balance/:address", getBalanceHandler);
router.get("/blocks", getAllBlocksHandler);

export default router;
