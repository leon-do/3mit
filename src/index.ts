import * as dotenv from "dotenv";
dotenv.config();
import { ethers } from "ethers";
import evmTransaction from "./evmTransaction";

// check if admin key is set
if (!process.env.X_ADMIN_KEY) throw new Error("X_ADMIN_KEY not set in .env file");
if (!process.env.WEBHOOK_URL) throw new Error("WEBHOOK_URL not set in .env file");

// start emitting transactions
evmTransaction(new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth"), 0);
// evmTransaction(new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli"), 0);
