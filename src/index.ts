import { ethers } from "ethers";
import axios from "axios";

main(new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli"), 0);

// main function to get blocks and POST transactions
async function main(_provider: ethers.providers.JsonRpcProvider, _lastBlock: number): Promise<void> {
  try {
    // delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    // get latest block number
    const blockNumber: number = await _provider.getBlockNumber();
    // check if there are new blocks
    if (blockNumber === _lastBlock) return main(_provider, _lastBlock);
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
          axios.post("http://localhost:3000/api/evm/transaction", webhookBody);
        });
    }
    return main(_provider, blockNumber);
  } catch {
    return main(_provider, _lastBlock);
  }
}
