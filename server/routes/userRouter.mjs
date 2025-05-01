import express from "express";
import {
  createUserHandler,
  getAllUsersHandler,
  getUserHandler,
  loginUserHandler
} from "../controllers/userController.mjs";

const userRouter = express.Router();

userRouter.post("/signup", createUserHandler);
userRouter.post("/login", loginUserHandler);
userRouter.get("/:username", getUserHandler);
userRouter.get("/", getAllUsersHandler);

export default userRouter;
