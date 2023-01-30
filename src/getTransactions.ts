import { ethers } from "ethers";
import handleTransaction from "./handleTransaction";

/*
 * This function will recursively call itself until it finds a new block. It will then loop through the transactions in the block and emit them to the webhook.
 * @param _provider ethers.providers.JsonRpcProvider
 * @param _lastBlock number
 * @returns Promise<void>
 * @example evmTransaction(new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli"), 0);
 * */
export default async function getTransactions(_provider: ethers.providers.JsonRpcProvider, _lastBlock: number, _timeOut: number): Promise<void> {
  try {
    // delay
    await new Promise((resolve) => setTimeout(resolve, _timeOut));
    // get latest block number
    const blockNumber: number = await _provider.getBlockNumber();
    // check if there are new blocks
    if (blockNumber <= _lastBlock) return getTransactions(_provider, _lastBlock, _timeOut);
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
          console.log(JSON.stringify(transactionResponse, null, 4));
          handleTransaction(transactionResponse);
        })
        .catch(() => {});
    }
    return getTransactions(_provider, blockNumber, _timeOut);
  } catch {
    return getTransactions(_provider, _lastBlock, _timeOut);
  }
}
