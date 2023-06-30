import { ethers } from "ethers"
import { Blockchain } from "./Blockchain"
import blockchains from "./blockchainOptions"

import { promises as fs } from 'fs';
import path from 'path';

import LamportAccountFactoryJSON from "./contracts/LamportAccountFactory.json"
import { Account } from "./Account"
import KeyTrackerB from "lamportwalletmanager/src/KeyTrackerB"

export function loadChain (chainName: string) : Blockchain {
    const chain = blockchains[chainName]
    if (!chain) {
        console.error(`Chain "${chainName}" not found. Exiting.`)
        process.exit(1)
    }
    return chain
}

export function loadProviders(chainName : string)  : [ethers.providers.JsonRpcProvider, ethers.providers.JsonRpcProvider] {
    const chain = loadChain(chainName)
    return [
        new ethers.providers.JsonRpcProvider(chain.normalRPC),
        new ethers.providers.JsonRpcProvider(chain.bundlerRPC),
    ]
}

export function loadFactory(chainName : string) : ethers.Contract {
    const chain = loadChain(chainName)
    const abi = LamportAccountFactoryJSON.abi
    const iface = new ethers.utils.Interface(abi)
    return new ethers.Contract(chain.factoryAddress, iface, loadProviders(chainName)[0])
}

export async function loadAccount(accountName: string): Promise<Account> {
    const accountsDirectory = 'accounts'
    let filenames;

    // Read accounts directory
    try {
        filenames = await fs.readdir(accountsDirectory);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            // If the accounts directory does not exist yet, that's not a problem
            console.error(`No accounts found with that name or any other. Exiting.`)
            process.exit(1)
        } else {
            throw error;
        }
    }

    // Find account with the given nickname
    function findFilename(accountName: string, filenames: string[]): string {
        const match = filenames.find(filename => filename.match(new RegExp(`^${accountName}_`)));
        if (match) {
            return match;
        } else {
            console.error(`No file found for account ${accountName}`);
            process.exit(1);
        }
    }

    const accountFilename = 'accounts/' + findFilename(accountName, filenames)

    if (!accountFilename) {
        console.error(`No accounts found with that name. Exiting.`)
        process.exit(1)
    }

    const selectedAccountContent = await fs.readFile(accountFilename, 'utf8');
    const selectedAccount = JSON.parse(selectedAccountContent);

    const kt = Object.assign(new KeyTrackerB(), JSON.parse(JSON.stringify(selectedAccount.keys))) as KeyTrackerB

    const oceKeys = selectedAccount.oceKeys?.map((k: any) => Object.assign(new KeyTrackerB(), JSON.parse(JSON.stringify(k)))) as KeyTrackerB[]


    return {
        ...selectedAccount,
        keys: kt,
        oceKeys: oceKeys

    } as Account
}
