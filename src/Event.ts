import axios from "axios";
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import { Trigger } from "@prisma/client";

type HookResponse = {
  transactionHash: string;
  [key: string]: any;
};

export default class Event {
  prisma: PrismaClient;
  provider: ethers.providers.JsonRpcProvider;
  chainId: number;
  blockNumber: number;

  constructor(_rpcUrl: string) {
    this.prisma = new PrismaClient();
    this.provider = new ethers.providers.JsonRpcProvider(_rpcUrl);
    this.chainId = 0;
    this.blockNumber = 0;
    this.getChainId();
  }

  // follow me to the depths of hell
  async emit(_blockNumber: number) {
    this.getTransactionHashes(_blockNumber).then((transactionHashes) => {
      transactionHashes.forEach((transactionHash) => {
        this.getTransactionLogs(transactionHash).then((logs) => {
          logs.forEach((log) => {
            this.queryDatabase(log).then((triggers) => {
              triggers.forEach(async (trigger) => {
                const response = this.getHookResponse(trigger, log);
                this.emitHookResponse(trigger, response);
              });
            });
          });
        });
      });
    });
  }

  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getChainId(): Promise<void> {
    this.chainId = await this.provider.getNetwork().then((network) => network.chainId);
  }

  async getTransactionHashes(_blockNumber: number): Promise<string[]> {
    const block: ethers.providers.Block = await this.provider.getBlock(_blockNumber);
    const transactionHashes: string[] = block.transactions;
    return transactionHashes;
  }

  async getTransactionLogs(_transactionHash: string): Promise<ethers.providers.Log[]> {
    const receipt = await this.provider.getTransactionReceipt(_transactionHash);
    return receipt.logs;
  }

  getHookResponse(_trigger: Trigger, _log: ethers.providers.Log): HookResponse | null {
    if (!_trigger.abi || !_trigger.event) return null;
    const hookResponse: HookResponse = { transactionHash: _log.transactionHash };
    const iface = new ethers.utils.Interface(_trigger.abi);
    // create empty object for each event
    const eventName = iface.events[_trigger.event].name;
    iface.events[_trigger.event].inputs.forEach((input) => {
      hookResponse[`${eventName}_${input.name}`] = null;
    });
    const eventSignature = iface.parseLog({ data: _log.data, topics: _log.topics });
    // only return hookResponse if eventSignature matches trigger
    if (eventSignature.signature !== _trigger.event) return null;
    // fill event object with values from eventSignature
    for (const key in eventSignature.args) {
      if (!isNaN(Number(key))) continue;
      const eventName = eventSignature.name;
      hookResponse[`${eventName}_${key}`] = eventSignature.args[key].toString();
    }
    return hookResponse;
  }

  async queryDatabase(_log: ethers.providers.Log): Promise<Trigger[]> {
    try {
      return this.prisma.trigger.findMany({
        where: {
          chainId: this.chainId,
          address: _log.address.toLowerCase(),
        },
      });
    } catch {
      return [];
    }
  }

  emitHookResponse(_trigger: Trigger, _hookResponse: HookResponse | null): void {
    if (!_hookResponse) return;
    axios.post(_trigger.webhookUrl, _hookResponse);
  }
}
