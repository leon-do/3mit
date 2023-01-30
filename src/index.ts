import * as dotenv from "dotenv";
dotenv.config();
import { ethers } from "ethers";
import getTransactions from "./getTransactions";
import getEvents from "./getEvents";

// check if admin key is set
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set in .env file");
if (!process.env.RPC_URL) throw new Error("RPC_URL not set in .env file");

// start emitting transactions and events
const rpcProvider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
getTransactions(rpcProvider, 0, 5000);
getEvents(rpcProvider, 0, 5000, 5);
