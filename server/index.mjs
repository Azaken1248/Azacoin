import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRouter.mjs";
import chainRoutes from "./routes/chainRouter.mjs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/user", userRoutes);
app.use("/chain", chainRoutes);

app.get("/", (_req, res) => {
  res.send("AzaChain API is running 🚀");
});

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
