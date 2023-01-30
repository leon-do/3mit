import axios from "axios";
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import { Trigger } from "@prisma/client";

const prisma = new PrismaClient();

type HookResponse = {
  transactionHash: string;
  fromAddress: string;
  toAddress: string;
  value: string;
  chainId: number;
  data: string;
  gasLimit: string;
};

export default async function handleTransaction(_transaction: ethers.providers.TransactionResponse) {
  // query triggers
  const triggers = await queryDatabase(_transaction);
  // filter events with no abi then format response object
  triggers.forEach((trigger) => {
    const hookResponse: HookResponse = {
      fromAddress: _transaction.from,
      toAddress: _transaction.to ? _transaction.to.toLowerCase() : "",
      value: ethers.BigNumber.from(_transaction.value).toString(),
      transactionHash: _transaction.hash,
      chainId: _transaction.chainId,
      data: _transaction.data,
      gasLimit: _transaction.gasLimit.toString(),
    };
    // POST reqeust to webhookUrl
    axios.post(trigger.webhookUrl, hookResponse);
  });
}

async function queryDatabase(transaction: ethers.providers.TransactionResponse): Promise<Trigger[]> {
  return await prisma.trigger.findMany({
    where: {
      chainId: transaction.chainId,
      abi: null,
      OR: [
        {
          address: transaction.from.toLowerCase(),
        },
        {
          address: transaction.to ? transaction.to.toLowerCase() : "",
        },
      ],
    },
  });
}
