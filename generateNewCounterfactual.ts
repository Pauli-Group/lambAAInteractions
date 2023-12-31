import { ethers } from "ethers"
import 'dotenv/config'
import saveCounterfactualOrigin from "./saveCounterfactualOrigin"
import KeyTrackerB from "lamportwalletmanager/src/KeyTrackerB"
import { address } from "./SolidityTypes"
import { Blockchain } from "./Blockchain"
import { loadFactory, loadProviders } from "./loaders"
import * as bip39 from 'bip39';
import accountInterface from "./accountInterface"

export default async function generateNewCounterfactual(blockchain: Blockchain, accountName: string): Promise<address> {
    const [normalProvider, bundlerProvider] = loadProviders(blockchain.name)

    let mnemonic: string = bip39.generateMnemonic(256);
    const ecdsaSigner = ethers.Wallet.fromMnemonic(mnemonic).connect(normalProvider)

    const keys = new KeyTrackerB()
    const initialKeys = keys.more(20)
    const initialKeyHashes = initialKeys.map(k => k.pkh)

    const factory = loadFactory(blockchain.name)
    const counterfactual = await factory.getAddress(ecdsaSigner.address, 0, initialKeyHashes)

    console.log(`Counterfactual address: ${counterfactual}`)

    const accountImplementation = await factory.accountImplementation()

    {   // generate the byte code needed to verify the proxy contract

        const bytecode = ethers.utils.defaultAbiCoder.encode(['address', 'bytes'], [
            accountImplementation, 
            accountInterface.encodeFunctionData('initialize', [
                ecdsaSigner.address,
                initialKeyHashes,
            ])
        ])

        console.log('Bytecode to verify proxy contract:', bytecode)

    }

    saveCounterfactualOrigin(
        counterfactual,
        blockchain.factoryAddress,
        keys,
        initialKeyHashes,
        ecdsaSigner,
        (await normalProvider.getNetwork()).chainId,
        blockchain.name,
        accountName,
        [],
    )

    return counterfactual
}