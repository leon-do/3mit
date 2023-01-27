import * as dotenv from "dotenv";
dotenv.config();
import { ethers } from "ethers";
import evmTransaction from "./evmTransaction";
import evmEvent from "./evmEvent";

// check if admin key is set
if (!process.env.X_ADMIN_KEY) throw new Error("X_ADMIN_KEY not set in .env file");

// start emitting transactions and events
const rpcProvider = new ethers.providers.JsonRpcProvider("https://eth-goerli.g.alchemy.com/v2/90U042zDfVPBxh9W4SZLotUqiZ9cDB1d");
evmTransaction(rpcProvider, 0, 5000);
evmEvent(rpcProvider, 0, 5, 5000);
