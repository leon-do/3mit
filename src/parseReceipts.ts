import { ethers } from "ethers";
import { Event } from "./types";

export default function parseReceipts(_receipts: ethers.providers.TransactionReceipt[]) {
  let events: Event[] = [];
  for (const receipt of _receipts) {
    if (!receipt.logs) continue;
    for (const log of receipt.logs) {
      const contractAddress = log.address;
      const transactionHash = receipt.transactionHash;
      const eventHash = log.topics[0];
      const args = log.topics.slice(1);
      const data = log.data;
      const event: Event = { contractAddress, transactionHash, eventHash, args, data };
      events.push(event);
    }
  }
  return events;
}
