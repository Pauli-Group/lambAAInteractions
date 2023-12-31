import { BigNumber, ethers } from 'ethers'
import { ethers as ethers2 } from 'ethers'
import {
    address,
    bytes,
    uint256
} from "./SolidityTypes";
import Monad, { AsyncMonad } from './Monad';
import {
    arrayify,
    defaultAbiCoder,
    hexDataSlice,
    keccak256
} from 'ethers/lib/utils'
import { ecsign, toRpcSig, keccak256 as keccak256_buffer } from 'ethereumjs-util'
import { sign_hash } from 'lamportwalletmanager/src';
import KeyTrackerB from 'lamportwalletmanager/src/KeyTrackerB';
import ENTRYPOINT from './EntryPoint';
import { loadProviders } from './loaders';
import { Account } from './Account';

export interface UserOperation {
    sender: address
    nonce: uint256
    initCode: bytes
    callData: bytes
    callGasLimit: uint256
    verificationGasLimit: uint256
    preVerificationGas: uint256
    maxFeePerGas: uint256
    maxPriorityFeePerGas: uint256
    paymasterAndData: bytes
    signature: bytes
}

export const DefaultsForUserOp: UserOperation = {
    sender: ethers.constants.AddressZero,
    nonce: 0,
    initCode: '0x',
    callData: '0x',
    callGasLimit: 100_000,
    verificationGasLimit: 2_000_000, // default verification gas.
    preVerificationGas: 1_010_000, // should also cover calldata cost.
    maxFeePerGas: 8e9,
    maxPriorityFeePerGas: 8e9,
    paymasterAndData: '0x',
    signature: '0x'
}

export function fillUserOpDefaults(op: Partial<UserOperation>): Monad<Partial<UserOperation>> {
    const defaults = DefaultsForUserOp
    const partial: any = { ...op }
    // we want "item:undefined" to be used from defaults, and not override defaults, so we must explicitly
    // remove those so "merge" will succeed.
    for (const key in partial) {
        if (partial[key] == null) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete partial[key]
        }
    }
    const filled = { ...defaults, ...partial }
    return Monad.of<Partial<UserOperation>>(filled)
}

export function fillUserOpDefaultsAsync(op: Partial<UserOperation>): AsyncMonad<Partial<UserOperation>> {
    const defaults = DefaultsForUserOp
    const partial: any = { ...op }
    // we want "item:undefined" to be used from defaults, and not override defaults, so we must explicitly
    // remove those so "merge" will succeed.
    for (const key in partial) {
        if (partial[key] == null) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete partial[key]
        }
    }
    const filled = { ...defaults, ...partial }
    return AsyncMonad.of<Partial<UserOperation>>(filled)
}

export function packUserOp(op: UserOperation, forSignature = true): string {
    if (forSignature) {
        return defaultAbiCoder.encode(
            ['address', 'uint256', 'bytes32', 'bytes32',
                'uint256', 'uint256', 'uint256', 'uint256', 'uint256',
                'bytes32'],
            [op.sender, op.nonce, keccak256(op.initCode), keccak256(op.callData),
            op.callGasLimit, op.verificationGasLimit, op.preVerificationGas, op.maxFeePerGas, op.maxPriorityFeePerGas,
            keccak256(op.paymasterAndData)])
    } else {
        // for the purpose of calculating gas cost encode also signature (and no keccak of bytes)
        return defaultAbiCoder.encode(
            ['address', 'uint256', 'bytes', 'bytes',
                'uint256', 'uint256', 'uint256', 'uint256', 'uint256',
                'bytes', 'bytes'],
            [op.sender, op.nonce, op.initCode, op.callData,
            op.callGasLimit, op.verificationGasLimit, op.preVerificationGas, op.maxFeePerGas, op.maxPriorityFeePerGas,
            op.paymasterAndData, op.signature])
    }
}

export function getUserOpHash(op: UserOperation, entryPoint: string, chainId: number): string {
    const userOpHash = keccak256(packUserOp(op, true))
    const enc = defaultAbiCoder.encode(
        ['bytes32', 'address', 'uint256'],
        [userOpHash, entryPoint, chainId])
    const temp = keccak256(enc)
    return temp
}

export function ecdsaSign(op: UserOperation, signer: ethers2.Wallet, entryPoint: string, chainId: number): string {
    const message = getUserOpHash(op, entryPoint, chainId)
    const msg1 = Buffer.concat([
        Buffer.from('\x19Ethereum Signed Message:\n32', 'ascii'),
        Buffer.from(arrayify(message))
    ])

    const sig = ecsign(keccak256_buffer(msg1), Buffer.from(arrayify(signer.privateKey)))
    // that's equivalent of:  await signer.signMessage(message);
    // (but without "async"
    const signedMessage1 = toRpcSig(sig.v, sig.r, sig.s)
    return signedMessage1
}

const show = (value: any) => {
    console.log(`value: `, value)
    return Monad.of(value)
}

const lamportSignUserOp = (op: UserOperation, signer: ethers2.Wallet, entryPoint: string, chainId: number, keys: KeyTrackerB): Monad<UserOperation> => {
    const ecdsaSig = ecdsaSign(op, signer, entryPoint, chainId)

    const message = getUserOpHash(op, entryPoint, chainId)
    const message2 = ethers.utils.hashMessage(ethers.utils.arrayify(message))
    const signingKeys = keys.getOne()
    const signature = sign_hash(message2, signingKeys.pri)

    const packedSignature = ethers.utils.defaultAbiCoder.encode(['bytes[256]', 'bytes32[2][256]', 'bytes'], [signature, signingKeys.pub, ecdsaSig])

    return Monad.of({
        ...op,
        signature: packedSignature
    } as UserOperation)
}

const lamportSignUserOpAsync = (op: UserOperation, signer: ethers2.Wallet, entryPoint: string, chainId: number, keys: KeyTrackerB): AsyncMonad<UserOperation> => {
    const ecdsaSig = ecdsaSign(op, signer, entryPoint, chainId)

    const message = getUserOpHash(op, entryPoint, chainId)
    const message2 = ethers.utils.hashMessage(ethers.utils.arrayify(message))
    const signingKeys = keys.getOne()
    const signature = sign_hash(message2, signingKeys.pri)

    const packedSignature = ethers.utils.defaultAbiCoder.encode(['bytes[256]', 'bytes32[2][256]', 'bytes'], [signature, signingKeys.pub, ecdsaSig])

    return AsyncMonad.of({
        ...op,
        signature: packedSignature
    } as UserOperation)
}

const gasMult = (multiplier: number) => (op: Partial<UserOperation>) => AsyncMonad.of({
    ...op,
    callGasLimit: BigNumber.from(op.callGasLimit).mul(multiplier),
    // verificationGasLimit: BigNumber.from(op.verificationGasLimit).mul(multiplier),
    // preVerificationGas: BigNumber.from(op.preVerificationGas).mul(multiplier),
} as UserOperation)

const estimateGas = async (account: Account, op: Partial<UserOperation>): Promise<AsyncMonad<UserOperation>> => {
    // create a mock signature for our estimate
    const opWithFakeSignature = JSON.parse(JSON.stringify(op)) as UserOperation
    const signer = ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath)
    const ecdsaSig = ecdsaSign(op as UserOperation, signer, ENTRYPOINT, account.network)
    const message = getUserOpHash(op as UserOperation, ENTRYPOINT, account.network)
    const message2 = ethers.utils.hashMessage(ethers.utils.arrayify(message))
    const notMyKeys = new KeyTrackerB() // can't use our real keys (OTS) because signed object will change after we have gas estimates
    notMyKeys.more(1)
    const signingKeys = notMyKeys.getOne()
    const signature = sign_hash(message2, signingKeys.pri)
    const packedSignature = ethers.utils.defaultAbiCoder.encode(['bytes[256]', 'bytes32[2][256]', 'bytes'], [signature, signingKeys.pub, ecdsaSig])
    opWithFakeSignature.signature = packedSignature

    const [normalProvider, bundlerProvider] = loadProviders(account.chainName)
    const est = await bundlerProvider.send('eth_estimateUserOperationGas', [opWithFakeSignature, ENTRYPOINT])
    console.log(`Estimate gas: `, est)

    op.callGasLimit = est.callGasLimit
    op.preVerificationGas = est.preVerificationGas
    op.verificationGasLimit = est.verificationGas

    return AsyncMonad.of(op as UserOperation)
}

    const stub = (msgDisplay : (op : UserOperation) => void) => (op : UserOperation) => {
        msgDisplay(op)
        return AsyncMonad.of(op as UserOperation)
    }

export {
    show,
    lamportSignUserOp,
    lamportSignUserOpAsync,
    estimateGas,
    gasMult ,
    stub,
}