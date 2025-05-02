import express from "express";
import { authenticateJWT } from "../middleware/authMiddleware.mjs";
import {
  createUserHandler,
  getAllUsersHandler,
  getUserHandler,
  loginUserHandler,
  requestTransactionHandler
} from "../controllers/userController.mjs";

const userRouter = express.Router();

userRouter.post('/request', authenticateJWT, requestTransactionHandler);
userRouter.post("/signup", createUserHandler);
userRouter.post("/login", loginUserHandler);
userRouter.get("/:username", getUserHandler);
userRouter.get("/", getAllUsersHandler);

export default userRouter;
