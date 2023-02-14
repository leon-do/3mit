import axios from "axios";
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import { Trigger } from "@prisma/client";
import { User } from "@prisma/client";

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2022-11-15" });

type HookResponse = {
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  value: string;
  chainId: number;
  data: string;
  gasLimit: string;
};

export default class Transaction {
  prisma: PrismaClient;
  provider: ethers.providers.JsonRpcProvider;
  blockNumber: number;

  constructor(_rpcUrl: string) {
    this.prisma = new PrismaClient();
    this.provider = new ethers.providers.JsonRpcProvider(_rpcUrl);
    this.blockNumber = 0;
  }

  // keep the fire growing deep inside... hell awaits
  async emit(_blockNumber: number) {
    this.getTransactionHashes(_blockNumber).then((transactionHashes) => {
      transactionHashes.forEach((transactionHash) => {
        this.getTransactionResponse(transactionHash).then((transactionResponse) => {
          this.queryDatabase(transactionResponse).then((triggers) => {
            triggers.forEach(async (trigger) => {
              if (trigger.user.stripe) {
                const { subscription } = await stripe.subscriptionItems.retrieve(trigger.user.stripe);
                const { default_payment_method } = await stripe.subscriptions.retrieve(subscription);
                const credits = await this.getUsage(trigger.user.stripe);
                const hookResponse: HookResponse = this.getHookResponse(transactionResponse);
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
  }

  async getBlockNumber(): Promise<number> {
    return await this.provider.getBlockNumber();
  }

  async getTransactionHashes(_blockNumber: number): Promise<string[]> {
    const block: ethers.providers.Block = await this.provider.getBlock(_blockNumber);
    const transactionHashes: string[] = block.transactions;
    return transactionHashes;
  }

  async getTransactionResponse(_transactionHash: string): Promise<ethers.providers.TransactionResponse> {
    const transactionResponse: ethers.providers.TransactionResponse = await this.provider.getTransaction(_transactionHash);
    return transactionResponse;
  }

  async queryDatabase(_transaction: ethers.providers.TransactionResponse): Promise<(Trigger & { user: User })[]> {
    // SELECT * FROM triggers WHERE chainId = _transaction.chainId AND abi IS NULL AND (address = _transaction.from OR address = _transaction.to) AND (user.credits <= 1000 OR user.paid = true)
    const data = await this.prisma.trigger.findMany({
      where: {
        chainId: _transaction.chainId,
        abi: null,
        AND: [
          {
            AND: [
              {
                address: _transaction.from.toLowerCase(),
              },
              {
                address: _transaction.to ? _transaction.to.toLowerCase() : "",
              },
            ],
          },
        ],
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

  getHookResponse(_transaction: ethers.providers.TransactionResponse): HookResponse {
    return {
      fromAddress: _transaction.from,
      toAddress: _transaction.to ? _transaction.to.toLowerCase() : "",
      value: ethers.BigNumber.from(_transaction.value).toString(),
      transactionHash: _transaction.hash,
      chainId: _transaction.chainId,
      data: _transaction.data,
      gasLimit: _transaction.gasLimit.toString(),
    };
  }

  emitHookResponse(_trigger: Trigger, _hookResponse: HookResponse): void {
    axios.post(_trigger.webhookUrl, _hookResponse);
  }

  async getUsage(_subscriptionId: string): Promise<number> {
    const usage = await stripe.subscriptionItems.listUsageRecordSummaries(_subscriptionId);
    return usage.data[0].total_usage;
  }
}
