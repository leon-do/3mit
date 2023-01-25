import { ethers } from "ethers";
import axios from "axios";

type EventResponse = {
  chainId: number;
  log: ethers.providers.Log;
};

/*
 * This function will recursively call itself until it finds a new block. It will then loop through the transactions in the block and emit them to the webhook.
 * @param _provider ethers.providers.JsonRpcProvider
 * @param _lastBlock number
 * @returns Promise<void>
 * @example evmTransaction(new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli"), 0);
 * */
export default async function evmEvent(_provider: ethers.providers.JsonRpcProvider, _lastBlock: number, _chainId: number): Promise<void> {
  try {
    // delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    // get latest block number
    const blockNumber: number = await _provider.getBlockNumber();
    // check if there are new blocks
    if (blockNumber === _lastBlock) return evmEvent(_provider, _lastBlock, _chainId);
    // get block info
    const block: ethers.providers.Block = await _provider.getBlock(blockNumber);
    // parse transactions from block info
    const transactionHashes = block.transactions;
    // loop through transaction hashes
    for (const transactionHash of transactionHashes) {
      // combine transaction and receipt info
      _provider
        .getTransactionReceipt(transactionHash)
        .then(async (transactionReceipt) => {
          for (const log of transactionReceipt.logs) {
            const eventResponse: EventResponse = {
              chainId: _chainId,
              log,
            };
            console.log(JSON.stringify(eventResponse, null, 4));
            axios
              .post("https://web3hook.leondo.repl.co/api/evm/event", eventResponse, {
                headers: {
                  "x-admin-key": process.env.X_ADMIN_KEY as string,
                },
              })
              .catch((error) => {
                console.error(error);
              });
          }
        })
        .catch(() => {
          return evmEvent(_provider, blockNumber, _chainId);
        });
    }
    return evmEvent(_provider, blockNumber, _chainId);
  } catch {
    return evmEvent(_provider, _lastBlock, _chainId);
  }
}
