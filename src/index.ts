import * as dotenv from "dotenv";
dotenv.config();
import { ethers } from "ethers";
import evmTransaction from "./evmTransaction";
import evmEvent from "./evmEvent";

// check if admin key is set
if (!process.env.X_ADMIN_KEY) throw new Error("X_ADMIN_KEY not set in .env file");

// start emitting transactions and events
evmTransaction(new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli"), 0);
// evmEvent(new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli"), 0, 5);