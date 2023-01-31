import * as dotenv from "dotenv";
dotenv.config();
import { ethers } from "ethers";
import getTransactions from "./getTransactions";
import getEvents from "./getEvents";

// check if admin key is set
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set in .env file");
if (!process.env.RPC_URL) throw new Error("RPC_URL not set in .env file");
if (!process.env.TIMEOUT) throw new Error("TIMEOUT not set in .env file");

// start emitting transactions and events
(async () => {
  const block = 0;
  const rpcProvider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const chainId = await rpcProvider.getNetwork().then((network) => network.chainId);
  const timeOut = parseInt(process.env.TIMEOUT as string);
  getTransactions(rpcProvider, block, timeOut);
  getEvents(rpcProvider, block, timeOut, chainId);
})();
