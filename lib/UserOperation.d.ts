import { ethers as ethers2 } from 'ethers';
import { address, bytes, uint256 } from "./SolidityTypes";
import Monad from './Monad';
import KeyTrackerB from 'lamportwalletmanager/src/KeyTrackerB';
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
export declare function fillUserOpDefaults(op: Partial<UserOperation>): Monad<UserOperation>;
export declare function packUserOp(op: UserOperation, forSignature?: boolean): string;
export declare function getUserOpHash(op: UserOperation, entryPoint: string, chainId: number): string;
export declare function ecdsaSign(op: UserOperation, signer: ethers2.Wallet, entryPoint: string, chainId: number): string;
declare const show: (value: any) => Monad<any>;
declare const lamportSignUserOp: (op: UserOperation, signer: ethers2.Wallet, entryPoint: string, chainId: number, keys: KeyTrackerB) => Monad<UserOperation>;
export { show, lamportSignUserOp, };
