import { ethers } from "ethers";
import { Blockchain } from "./Blockchain";
import { Account } from "./Account";
export declare function loadChain(chainName: string): Blockchain;
export declare function loadProviders(chainName: string): [ethers.providers.JsonRpcProvider, ethers.providers.JsonRpcProvider];
export declare function loadFactory(chainName: string): ethers.Contract;
export declare function loadAccount(accountName: string): Promise<Account>;
