import { ethers } from "ethers";
import axios from "axios";

/*
 * This function will recursively call itself until it finds a new block. It will then loop through the transactions in the block and emit them to the webhook.
 * @param _provider ethers.providers.JsonRpcProvider
 * @param _lastBlock number
 * @returns Promise<void>
 * @example evmTransaction(new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli"), 0);
 * */
export default async function evmTransaction(_provider: ethers.providers.JsonRpcProvider, _lastBlock: number): Promise<void> {
  try {
    // delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    // get latest block number
    const blockNumber: number = await _provider.getBlockNumber();
    // check if there are new blocks
    if (blockNumber === _lastBlock) return evmTransaction(_provider, _lastBlock);
    // get block info
    const block: ethers.providers.Block = await _provider.getBlock(blockNumber);
    // parse transactions from block info
    const transactionHashes = block.transactions;
    // loop through transaction hashes
    for (const transactionHash of transactionHashes) {
      // combine transaction and receipt info
      _provider
        .getTransaction(transactionHash)
        .then(async (transactionResponse) => {
          const transactionReceipt: ethers.providers.TransactionReceipt = await _provider.getTransactionReceipt(transactionResponse.hash);
          const webhookBody: ethers.providers.TransactionResponse & ethers.providers.TransactionReceipt = { ...transactionResponse, ...transactionReceipt };
          return webhookBody;
        })
        .then((webhookBody) => {
          // console.log(webhookBody);
          axios.post(process.env.WEBHOOK_URL, JSON.stringify(webhookBody), {
            headers: {
              "admin-key": process.env.ADMIN_KEY,
            },
          });
        });
    }
    return evmTransaction(_provider, blockNumber);
  } catch {
    return evmTransaction(_provider, _lastBlock);
  }
}
