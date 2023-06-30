import KeyTrackerB from "lamportwalletmanager/src/KeyTrackerB";
import { address } from "./SolidityTypes";

export type Account = {
    counterfactual: address,
    keys: KeyTrackerB,
    initialKeyHashes: string[],
    chainName: string,
    ecdsaSecret: string,
    ecdsaPath: string,
    factory: address,
    salt: number,
    signerAddress: address,
    network: number,
    accountName: string,
    oceKeys: KeyTrackerB[] | null,
}