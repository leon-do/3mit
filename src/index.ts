import * as dotenv from "dotenv";
dotenv.config();
import Event from "./Event";
import Transaction from "./Transaction";

// check if admin key is set
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set in .env file");
if (!process.env.RPC_URL) throw new Error("RPC_URL not set in .env file");
if (!process.env.TIMEOUT) throw new Error("TIMEOUT not set in .env file");

// create event and transaction instances
const event = new Event(process.env.RPC_URL);
const transaction = new Transaction(process.env.RPC_URL);

// check for new blocks and emit transactioin when new blocks are found
startTransaction(0);
async function startTransaction(_lastBlockNumber: number): Promise<void> {
  try {
    await new Promise((resolve) => setTimeout(resolve, parseInt(process.env.TIMEOUT as string)));
    const blockNumber = await event.getBlockNumber();
    if (blockNumber > _lastBlockNumber) {
      transaction.emit(blockNumber);
      return startTransaction(blockNumber);
    } else {
      return startTransaction(_lastBlockNumber);
    }
  } catch {
    return startTransaction(_lastBlockNumber);
  }
}

// check for new blocks and emit event when new blocks are found
startEvent(0);
async function startEvent(_lastBlockNumber: number): Promise<void> {
  try {
    await new Promise((resolve) => setTimeout(resolve, parseInt(process.env.TIMEOUT as string)));
    const blockNumber = await event.getBlockNumber();
    if (blockNumber > _lastBlockNumber) {
      event.emit(blockNumber);
      return startEvent(blockNumber);
    } else {
      return startEvent(_lastBlockNumber);
    }
  } catch {
    return startEvent(_lastBlockNumber);
  }
}
