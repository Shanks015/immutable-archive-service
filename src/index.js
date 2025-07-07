import express from "express";
import dotenv from "dotenv";
import blockchainRouter from "./routes/blockchainRoutes.js";

dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
    res.send("Hello World!");
});

app.use("/api", blockchainRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
