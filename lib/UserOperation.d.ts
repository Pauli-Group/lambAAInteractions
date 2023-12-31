import { ethers as ethers2 } from 'ethers';
import { address, bytes, uint256 } from "./SolidityTypes";
import Monad, { AsyncMonad } from './Monad';
import KeyTrackerB from 'lamportwalletmanager/src/KeyTrackerB';
import { Account } from './Account';
export interface UserOperation {
    sender: address;
    nonce: uint256;
    initCode: bytes;
    callData: bytes;
    callGasLimit: uint256;
    verificationGasLimit: uint256;
    preVerificationGas: uint256;
    maxFeePerGas: uint256;
    maxPriorityFeePerGas: uint256;
    paymasterAndData: bytes;
    signature: bytes;
}
export declare const DefaultsForUserOp: UserOperation;
export declare function fillUserOpDefaults(op: Partial<UserOperation>): Monad<Partial<UserOperation>>;
export declare function fillUserOpDefaultsAsync(op: Partial<UserOperation>): AsyncMonad<Partial<UserOperation>>;
export declare function packUserOp(op: UserOperation, forSignature?: boolean): string;
export declare function getUserOpHash(op: UserOperation, entryPoint: string, chainId: number): string;
export declare function ecdsaSign(op: UserOperation, signer: ethers2.Wallet, entryPoint: string, chainId: number): string;
declare const show: (value: any) => Monad<any>;
declare const lamportSignUserOp: (op: UserOperation, signer: ethers2.Wallet, entryPoint: string, chainId: number, keys: KeyTrackerB) => Monad<UserOperation>;
declare const lamportSignUserOpAsync: (op: UserOperation, signer: ethers2.Wallet, entryPoint: string, chainId: number, keys: KeyTrackerB) => AsyncMonad<UserOperation>;
declare const gasMult: (multiplier: number) => (op: Partial<UserOperation>) => AsyncMonad<UserOperation>;
declare const estimateGas: (account: Account, op: Partial<UserOperation>) => Promise<AsyncMonad<UserOperation>>;
declare const stub: (msgDisplay: (op: UserOperation) => void) => (op: UserOperation) => AsyncMonad<UserOperation>;
export { show, lamportSignUserOp, lamportSignUserOpAsync, estimateGas, gasMult, stub, };
