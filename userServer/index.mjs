import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRouter.mjs";

dotenv.config();
const app = express();
const PORT = process.env.USER_PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/user", userRoutes);

app.get("/", (_req, res) => {
  res.send("User API is running");
});

app.listen(PORT, () => {
  console.log(`User Server running on port ${PORT}`);
});
