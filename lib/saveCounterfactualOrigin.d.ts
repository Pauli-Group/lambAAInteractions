import { address } from "./SolidityTypes";
import KeyTrackerB from "lamportwalletmanager/src/KeyTrackerB";
export default function saveCounterfactualOrigin(counterfactual: address, factoryAddress: address, keys: KeyTrackerB, initialKeyHashes: string[], ecdsaSigner: any, chainId: number, chainName: string, accountName: string, oceKeys: KeyTrackerB[]): void;
