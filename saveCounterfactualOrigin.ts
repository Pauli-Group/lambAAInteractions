import { address } from "./SolidityTypes";
import fs from 'fs'
import KeyTrackerB from "lamportwalletmanager/src/KeyTrackerB";

export default function saveCounterfactualOrigin(counterfactual : address, factoryAddress : address, keys : KeyTrackerB, initialKeyHashes : string[],  ecdsaSigner : any , chainId : number, chainName: string, accountName : string, oceKeys: KeyTrackerB[]) {
    const originFile = `accounts/${accountName}_${counterfactual}.json` // date first so its easier to sort.. counterfactual ddress for searching
    const originObject = {
        counterfactual: counterfactual,
        factory: factoryAddress,
        keys: keys,
        initialKeyHashes: initialKeyHashes,
        signerAddress: ecdsaSigner.address,
        salt: 0,
        network: chainId,
        chainName: chainName,
        ecdsaSecret: ecdsaSigner.mnemonic.phrase,
        ecdsaPath: ecdsaSigner.mnemonic.path,
        accountName: accountName,
        oceKeys: oceKeys,
    }

    if (!fs.existsSync('accounts')) {
        fs.mkdirSync('accounts');
    }

    fs.writeFileSync(originFile, JSON.stringify(originObject, null, 2))
    console.log(`Keys saved to ${originFile}`)
}
