import * as dotenv from "dotenv";
dotenv.config();
import Transaction from "./Transaction";
import Event from "./Event";

// check if admin key is set
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set in .env file");

// prettier-ignore
const rpcs = [
  "https://ethereum.publicnode.com",          // eth
  "https://ethereum-goerli.publicnode.com",   // goerli 
  "https://polygon-bor.publicnode.com",       // polygon
  "https://mainnet.era.zksync.io",            // zksync
];

for (const rpc of rpcs) {
  startTransaction(new Transaction(rpc), 0);
  startEvent(new Event(rpc), 0);
}

// check for new blocks and emit transactioin when new blocks are found
async function startTransaction(_transaction: Transaction, _lastBlockNumber: number): Promise<void> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const blockNumber = await _transaction.getBlockNumber();
    if (blockNumber > _lastBlockNumber) {
      _transaction.emit(blockNumber);
      return startTransaction(_transaction, blockNumber);
    } else {
      return startTransaction(_transaction, _lastBlockNumber);
    }
  } catch {
    return startTransaction(_transaction, _lastBlockNumber);
  }
}

async function startEvent(_event: Event, _lastBlockNumber: number): Promise<void> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const blockNumber = await _event.getBlockNumber();
    if (blockNumber > _lastBlockNumber) {
      _event.emit(blockNumber);
      return startEvent(_event, blockNumber);
    } else {
      return startEvent(_event, _lastBlockNumber);
    }
  } catch {
    return startEvent(_event, _lastBlockNumber);
  }
}
