"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stub = exports.gasMult = exports.estimateGas = exports.lamportSignUserOpAsync = exports.lamportSignUserOp = exports.show = exports.ecdsaSign = exports.getUserOpHash = exports.packUserOp = exports.fillUserOpDefaultsAsync = exports.fillUserOpDefaults = exports.DefaultsForUserOp = void 0;
const ethers_1 = require("ethers");
const Monad_1 = __importStar(require("./Monad"));
const utils_1 = require("ethers/lib/utils");
const ethereumjs_util_1 = require("ethereumjs-util");
const src_1 = require("lamportwalletmanager/src");
const KeyTrackerB_1 = __importDefault(require("lamportwalletmanager/src/KeyTrackerB"));
const EntryPoint_1 = __importDefault(require("./EntryPoint"));
const loaders_1 = require("./loaders");
exports.DefaultsForUserOp = {
    sender: ethers_1.ethers.constants.AddressZero,
    nonce: 0,
    initCode: '0x',
    callData: '0x',
    callGasLimit: 100000,
    verificationGasLimit: 2000000,
    preVerificationGas: 1010000,
    maxFeePerGas: 8e9,
    maxPriorityFeePerGas: 8e9,
    paymasterAndData: '0x',
    signature: '0x'
};
function fillUserOpDefaults(op) {
    const defaults = exports.DefaultsForUserOp;
    const partial = Object.assign({}, op);
    // we want "item:undefined" to be used from defaults, and not override defaults, so we must explicitly
    // remove those so "merge" will succeed.
    for (const key in partial) {
        if (partial[key] == null) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete partial[key];
        }
    }
    const filled = Object.assign(Object.assign({}, defaults), partial);
    return Monad_1.default.of(filled);
}
exports.fillUserOpDefaults = fillUserOpDefaults;
function fillUserOpDefaultsAsync(op) {
    const defaults = exports.DefaultsForUserOp;
    const partial = Object.assign({}, op);
    // we want "item:undefined" to be used from defaults, and not override defaults, so we must explicitly
    // remove those so "merge" will succeed.
    for (const key in partial) {
        if (partial[key] == null) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete partial[key];
        }
    }
    const filled = Object.assign(Object.assign({}, defaults), partial);
    return Monad_1.AsyncMonad.of(filled);
}
exports.fillUserOpDefaultsAsync = fillUserOpDefaultsAsync;
function packUserOp(op, forSignature = true) {
    if (forSignature) {
        return utils_1.defaultAbiCoder.encode(['address', 'uint256', 'bytes32', 'bytes32',
            'uint256', 'uint256', 'uint256', 'uint256', 'uint256',
            'bytes32'], [op.sender, op.nonce, (0, utils_1.keccak256)(op.initCode), (0, utils_1.keccak256)(op.callData),
            op.callGasLimit, op.verificationGasLimit, op.preVerificationGas, op.maxFeePerGas, op.maxPriorityFeePerGas,
            (0, utils_1.keccak256)(op.paymasterAndData)]);
    }
    else {
        // for the purpose of calculating gas cost encode also signature (and no keccak of bytes)
        return utils_1.defaultAbiCoder.encode(['address', 'uint256', 'bytes', 'bytes',
            'uint256', 'uint256', 'uint256', 'uint256', 'uint256',
            'bytes', 'bytes'], [op.sender, op.nonce, op.initCode, op.callData,
            op.callGasLimit, op.verificationGasLimit, op.preVerificationGas, op.maxFeePerGas, op.maxPriorityFeePerGas,
            op.paymasterAndData, op.signature]);
    }
}
exports.packUserOp = packUserOp;
function getUserOpHash(op, entryPoint, chainId) {
    const userOpHash = (0, utils_1.keccak256)(packUserOp(op, true));
    const enc = utils_1.defaultAbiCoder.encode(['bytes32', 'address', 'uint256'], [userOpHash, entryPoint, chainId]);
    const temp = (0, utils_1.keccak256)(enc);
    return temp;
}
exports.getUserOpHash = getUserOpHash;
function ecdsaSign(op, signer, entryPoint, chainId) {
    const message = getUserOpHash(op, entryPoint, chainId);
    const msg1 = Buffer.concat([
        Buffer.from('\x19Ethereum Signed Message:\n32', 'ascii'),
        Buffer.from((0, utils_1.arrayify)(message))
    ]);
    const sig = (0, ethereumjs_util_1.ecsign)((0, ethereumjs_util_1.keccak256)(msg1), Buffer.from((0, utils_1.arrayify)(signer.privateKey)));
    // that's equivalent of:  await signer.signMessage(message);
    // (but without "async"
    const signedMessage1 = (0, ethereumjs_util_1.toRpcSig)(sig.v, sig.r, sig.s);
    return signedMessage1;
}
exports.ecdsaSign = ecdsaSign;
const show = (value) => {
    console.log(`value: `, value);
    return Monad_1.default.of(value);
};
exports.show = show;
const lamportSignUserOp = (op, signer, entryPoint, chainId, keys) => {
    const ecdsaSig = ecdsaSign(op, signer, entryPoint, chainId);
    const message = getUserOpHash(op, entryPoint, chainId);
    const message2 = ethers_1.ethers.utils.hashMessage(ethers_1.ethers.utils.arrayify(message));
    const signingKeys = keys.getOne();
    const signature = (0, src_1.sign_hash)(message2, signingKeys.pri);
    const packedSignature = ethers_1.ethers.utils.defaultAbiCoder.encode(['bytes[256]', 'bytes32[2][256]', 'bytes'], [signature, signingKeys.pub, ecdsaSig]);
    return Monad_1.default.of(Object.assign(Object.assign({}, op), { signature: packedSignature }));
};
exports.lamportSignUserOp = lamportSignUserOp;
const lamportSignUserOpAsync = (op, signer, entryPoint, chainId, keys) => {
    const ecdsaSig = ecdsaSign(op, signer, entryPoint, chainId);
    const message = getUserOpHash(op, entryPoint, chainId);
    const message2 = ethers_1.ethers.utils.hashMessage(ethers_1.ethers.utils.arrayify(message));
    const signingKeys = keys.getOne();
    const signature = (0, src_1.sign_hash)(message2, signingKeys.pri);
    const packedSignature = ethers_1.ethers.utils.defaultAbiCoder.encode(['bytes[256]', 'bytes32[2][256]', 'bytes'], [signature, signingKeys.pub, ecdsaSig]);
    return Monad_1.AsyncMonad.of(Object.assign(Object.assign({}, op), { signature: packedSignature }));
};
exports.lamportSignUserOpAsync = lamportSignUserOpAsync;
const gasMult = (multiplier) => (op) => Monad_1.AsyncMonad.of(Object.assign(Object.assign({}, op), { callGasLimit: ethers_1.BigNumber.from(op.callGasLimit).mul(multiplier) }));
exports.gasMult = gasMult;
const estimateGas = (account, op) => __awaiter(void 0, void 0, void 0, function* () {
    // create a mock signature for our estimate
    const opWithFakeSignature = JSON.parse(JSON.stringify(op));
    const signer = ethers_1.ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath);
    const ecdsaSig = ecdsaSign(op, signer, EntryPoint_1.default, account.network);
    const message = getUserOpHash(op, EntryPoint_1.default, account.network);
    const message2 = ethers_1.ethers.utils.hashMessage(ethers_1.ethers.utils.arrayify(message));
    const notMyKeys = new KeyTrackerB_1.default(); // can't use our real keys (OTS) because signed object will change after we have gas estimates
    notMyKeys.more(1);
    const signingKeys = notMyKeys.getOne();
    const signature = (0, src_1.sign_hash)(message2, signingKeys.pri);
    const packedSignature = ethers_1.ethers.utils.defaultAbiCoder.encode(['bytes[256]', 'bytes32[2][256]', 'bytes'], [signature, signingKeys.pub, ecdsaSig]);
    opWithFakeSignature.signature = packedSignature;
    const [normalProvider, bundlerProvider] = (0, loaders_1.loadProviders)(account.chainName);
    const est = yield bundlerProvider.send('eth_estimateUserOperationGas', [opWithFakeSignature, EntryPoint_1.default]);
    console.log(`Estimate gas: `, est);
    op.callGasLimit = est.callGasLimit;
    op.preVerificationGas = est.preVerificationGas;
    op.verificationGasLimit = est.verificationGas;
    return Monad_1.AsyncMonad.of(op);
});
exports.estimateGas = estimateGas;
const stub = (msgDisplay) => (op) => {
    msgDisplay(op);
    return Monad_1.AsyncMonad.of(op);
};
exports.stub = stub;
