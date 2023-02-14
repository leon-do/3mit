import axios from "axios";
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import { Trigger } from "@prisma/client";
import { User } from "@prisma/client";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2022-11-15" });

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

  // you're never alone, walk with me in hell
  async emit(_blockNumber: number) {
    this.getTransactionHashes(_blockNumber).then((transactionHashes) => {
      transactionHashes.forEach((transactionHash) => {
        this.getTransactionLogs(transactionHash).then((logs) => {
          logs.forEach((log) => {
            this.queryDatabase(log).then((triggers) => {
              triggers.forEach(async (trigger) => {
                if (trigger.user.stripe) {
                  const { subscription } = await stripe.subscriptionItems.retrieve(trigger.user.stripe!);
                  const { default_payment_method } = await stripe.subscriptions.retrieve(subscription);
                  const credits = await this.getUsage(trigger.user.stripe);
                  const hookResponse: HookResponse | null = this.getHookResponse(trigger, log);
                  if (hookResponse && (credits < 1000 || default_payment_method)) {
                    this.emitHookResponse(trigger, hookResponse);
                    this.incrementCredits(trigger.user.stripe);
                  }
                }
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
    // fill event object with values from eventSignature
    for (const key in eventSignature.args) {
      if (!isNaN(Number(key))) continue;
      const eventName = eventSignature.name;
      hookResponse[`${eventName}_${key}`] = eventSignature.args[key].toString();
    }
    return hookResponse;
  }

  async queryDatabase(_log: ethers.providers.Log): Promise<(Trigger & { user: User })[]> {
    // SELECT * FROM triggers WHERE chainId = this.chainId AND address = _log.address AND (user.credits <= 1000 OR user.paid = true)
    const data = await this.prisma.trigger.findMany({
      where: {
        chainId: this.chainId,
        address: _log.address.toLowerCase(),
      },
      include: {
        user: true,
      },
    });
    return data;
  }

  async incrementCredits(_subscriptionId: string): Promise<Stripe.Response<Stripe.UsageRecord>> {
    const increment = await stripe.subscriptionItems.createUsageRecord(_subscriptionId, {
      quantity: 1,
      action: "increment",
    });
    return increment;
  }

  emitHookResponse(_trigger: Trigger, _hookResponse: HookResponse): void {
    axios.post(_trigger.webhookUrl, _hookResponse);
  }

  async getUsage(_subscriptionId: string): Promise<number> {
    const usage = await stripe.subscriptionItems.listUsageRecordSummaries(_subscriptionId);
    return usage.data[0].total_usage;
  }
}
