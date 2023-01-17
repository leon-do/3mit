import * as dotenv from "dotenv";
dotenv.config();
import { ethers } from "ethers";
import wss from "./wss";
import parseReceipts from "./parseReceipts";
import { Event } from "./types";

// connect to ethereum websocket provider
const provider = new ethers.providers.WebSocketProvider(process.env.RPC_URL as string);

// listen to new blocks
provider.on("block", async (_blockNumber: number) => {
  // get block info
  const block: ethers.providers.Block = await provider.getBlock(_blockNumber);
  // parse transactions from block info
  const transactions = block.transactions;
  // get receipts from all transactions
  const receipts: ethers.providers.TransactionReceipt[] = await Promise.all(transactions.map((transactions) => provider.getTransactionReceipt(transactions)));
  // parse receipts
  const events: Event[] = parseReceipts(receipts);
  // log events
  for (const event of events) {
    console.log(event);
    // send event to websocket server
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(event));
    });
  }
});
