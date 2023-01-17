import * as dotenv from "dotenv";
dotenv.config();
import { ethers } from "ethers";

// Events to emit
interface Events {
  contractAddress: string;
  transactionHash: string;
  eventHash: string;
  args: string[];
  data: string;
}

// connect to ethereum websocket provider
const provider = new ethers.providers.WebSocketProvider(process.env.RPC_URL as string);

// listen to new blocks
provider.on("block", async (_blockNumber) => {
  const block: ethers.providers.Block = await provider.getBlock(_blockNumber);
  const transactions = block.transactions;
  const receipts: ethers.providers.TransactionReceipt[] = await Promise.all(transactions.map((transactions) => provider.getTransactionReceipt(transactions)));
  const events: Events[] = parseReceipts(receipts);
  for (const event of events) {
    console.log(event);
  }
});

function parseReceipts(_receipts: ethers.providers.TransactionReceipt[]) {
  let events: Events[] = [];
  for (const receipt of _receipts) {
    for (const log of receipt.logs) {
      const contractAddress = log.address;
      const transactionHash = receipt.transactionHash;
      const eventHash = log.topics[0];
      const args = log.topics.slice(1);
      const data = log.data;
      events.push({ contractAddress, transactionHash, eventHash, args, data });
    }
  }
  return events;
}
