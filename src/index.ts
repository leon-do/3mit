import * as dotenv from "dotenv";
dotenv.config();
import Transaction from "./Transaction";
import Event from "./Event";

// check if admin key is set
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set in .env file");
if (!process.env.RPC_URL) throw new Error("RPC_URL not set in .env file");

// create transaction & event instances
const transaction = new Transaction(process.env.RPC_URL);
const event = new Event(process.env.RPC_URL);

// check for new blocks and emit transactioin when new blocks are found
startTransaction(0);
async function startTransaction(_lastBlockNumber: number): Promise<void> {
  try {
    const blockNumber = await transaction.getBlockNumber();
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

startEvent(0);
async function startEvent(_lastBlockNumber: number): Promise<void> {
  try {
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
