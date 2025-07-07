import { ethers, JsonRpcProvider } from "ethers";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const abiPath = path.join(__dirname, "./FileStorageABI.json");
const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
const BLOCKCHAIN_RPC_URL = process.env.BLOCKCHAIN_RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

console.log("BLOCKCHAIN_RPC_URL:", BLOCKCHAIN_RPC_URL);
console.log("CONTRACT_ADDRESS:", CONTRACT_ADDRESS);

const provider = new JsonRpcProvider(BLOCKCHAIN_RPC_URL, {
  chainId: 12345,
  name: "private",
});

const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

export { provider, contract };
