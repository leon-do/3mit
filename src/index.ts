import { ethers } from "ethers";
import evmTransaction from "./evmTransaction";

evmTransaction(new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli"), 0);
