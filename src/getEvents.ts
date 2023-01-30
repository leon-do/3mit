import { ethers } from "ethers";
import handleEvent from "./handleEvent";

/*
 * This function will recursively call itself until it finds a new block. It will then loop through the transactions in the block and emit them to the webhook.
 * @param _provider ethers.providers.JsonRpcProvider
 * @param _lastBlock number
 * @returns Promise<void>
 * @example evmTransaction(new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli"), 0);
 * */
export default async function getEvents(_provider: ethers.providers.JsonRpcProvider, _lastBlock: number, _timeOut: number, _chainId: number): Promise<void> {
  try {
    // delay
    await new Promise((resolve) => setTimeout(resolve, _timeOut));
    // get latest block number
    const blockNumber: number = await _provider.getBlockNumber();
    // check if there are new blocks
    if (blockNumber <= _lastBlock) return getEvents(_provider, _lastBlock, _chainId, _timeOut);
    // get block info
    const block: ethers.providers.Block = await _provider.getBlock(blockNumber);
    // parse transactions from block info
    const transactionHashes: string[] = block.transactions;
    // loop through transaction hashes
    for (const transactionHash of transactionHashes) {
      // combine transaction and receipt info
      _provider
        .getTransactionReceipt(transactionHash)
        .then(async (transactionReceipt) => {
          for (const log of transactionReceipt.logs) {
            console.log(JSON.stringify(log, null, 4));
            handleEvent(log, _chainId);
          }
        })
        .catch(() => {});
    }
    return getEvents(_provider, blockNumber, _chainId, _timeOut);
  } catch {
    return getEvents(_provider, _lastBlock, _chainId, _timeOut);
  }
}
