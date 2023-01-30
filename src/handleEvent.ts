import axios from "axios";
import { ethers } from "ethers";
import { PrismaClient } from "@prisma/client";
import { Trigger } from "@prisma/client";

const prisma = new PrismaClient();

type HookResponse = {
  transactionHash: string;
  [key: string]: any;
};

/*
 * Gets event log, checks if it matches any triggers, and emits to webhook
 */
export default async function handleEvent(_log: ethers.providers.Log, _chainId: number) {
  // query triggers
  const triggers = await queryDatabase(_log, _chainId);
  // filter events with abi then format response object
  triggers.forEach((trigger) => {
    const hookResponse: HookResponse = getHookResponse(trigger.abi || "[]", _log);
    // POST to webhookUrl
    axios.post(trigger.webhookUrl, hookResponse);
  });
}

async function queryDatabase(_log: ethers.providers.Log, _chainId: number): Promise<Trigger[]> {
  return await prisma.trigger.findMany({
    where: {
      chainId: _chainId,
      address: _log.address.toLowerCase(),
    },
  });
}

/*
 * Creates response object to emit to zapier
 */
function getHookResponse(_abi: string, _log: ethers.providers.Log): HookResponse {
  const hookResponse: HookResponse = { transactionHash: _log.transactionHash };
  const iface = new ethers.utils.Interface(_abi);
  // fill event object with null values
  for (const key in iface.events) {
    const eventName = iface.events[key].name;
    iface.events[key].inputs.forEach((input) => {
      hookResponse[`${eventName}_${input.name}`] = null;
    });
  }
  const eventSignature = iface.parseLog({ data: _log.data, topics: _log.topics });
  // fill event object with values from eventSignature
  for (const key in eventSignature.args) {
    if (!isNaN(Number(key))) continue;
    const eventName = eventSignature.name;
    hookResponse[`${eventName}_${key}`] = eventSignature.args[key].toString();
  }
  return hookResponse;
}
