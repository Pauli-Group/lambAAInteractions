"use strict";
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
const KeyTrackerB_1 = __importDefault(require("lamportwalletmanager/src/KeyTrackerB"));
const merkle_tree_1 = require("@openzeppelin/merkle-tree");
const loaders_1 = require("./loaders");
const EntryPoint_1 = __importDefault(require("./EntryPoint"));
const accountInterface_1 = __importDefault(require("./accountInterface"));
const Monad_1 = require("./Monad");
const getInitCode_1 = __importDefault(require("./getInitCode"));
const getNonce_1 = __importDefault(require("./getNonce"));
const ethers_1 = require("ethers");
const UserOperation_1 = require("./UserOperation");
const submitUserOperationViaBundler_1 = __importDefault(require("./submitUserOperationViaBundler"));
const saveAccount_1 = __importDefault(require("./saveAccount"));
const finishInit = (_accountName, depositAmount, extraActivities = null) => __awaiter(void 0, void 0, void 0, function* () {
    const oceKeyTracker = new KeyTrackerB_1.default();
    const oceKeyCount = 128;
    const oceKeys = oceKeyTracker.more(oceKeyCount);
    const ocePKHs = oceKeys
        .map(k => k.pkh)
        .map((pkh) => [pkh]); // StandardMerkleTree expects an array of arrays
    const tree = merkle_tree_1.StandardMerkleTree.of(ocePKHs, ["bytes32"]);
    const account = yield (0, loaders_1.loadAccount)(_accountName.toLowerCase());
    if (!account.oceKeys) {
        account.oceKeys = [];
    }
    account.oceKeys.push(oceKeyTracker);
    // generate more account keys
    const additionalKeys = account.keys.more(30);
    const additionalKeyHashes = additionalKeys.map(k => k.pkh);
    /*
        Calls:
            1. deposit funds into the entry point
            2. endorse merkle root for off chain signatures
            3. add more keys
            4. call second initializer
    */
    const dest = [
        EntryPoint_1.default,
        account.counterfactual,
        account.counterfactual,
        account.counterfactual,
    ];
    const value = [
        depositAmount,
        0,
        0,
        0,
    ];
    const func = [
        '0x',
        accountInterface_1.default.encodeFunctionData('endorseMerkleRoot', [tree.root]),
        accountInterface_1.default.encodeFunctionData('addPublicKeyHashes', [additionalKeyHashes]),
        accountInterface_1.default.encodeFunctionData('initializePullPaymentsAndERC777Support', []),
    ];
    if (extraActivities !== null) {
        console.log("Extra activities detected");
        console.log(extraActivities);
        dest.push(...(extraActivities.dest));
        value.push(...(extraActivities.value));
        func.push(...(extraActivities.func));
    }
    const callData = accountInterface_1.default.encodeFunctionData('executeBatchWithValue', [
        dest,
        value,
        func,
    ]);
    const estimateGasWithAccount = UserOperation_1.estimateGas.bind(null, account);
    const userOp = Monad_1.AsyncMonad.of({
        sender: account.counterfactual,
        initCode: yield (0, getInitCode_1.default)(account),
        callData: callData,
        nonce: yield (0, getNonce_1.default)(account),
        // callGasLimit: BigNumber.from(10_000_000).add(extraActivities?.estimatedAdditionalGas ?? 0),
    })
        .bind(UserOperation_1.fillUserOpDefaultsAsync)
        .bind(estimateGasWithAccount)
        .bind((0, UserOperation_1.gasMult)(50))
        .bind((0, UserOperation_1.stub)((op) => console.log("Estimated total gas is", ethers_1.BigNumber.from(op === null || op === void 0 ? void 0 : op.callGasLimit).add(op === null || op === void 0 ? void 0 : op.preVerificationGas).add(op === null || op === void 0 ? void 0 : op.verificationGasLimit).toString())))
        .bind((uo) => (0, UserOperation_1.lamportSignUserOpAsync)(uo, ethers_1.ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath), EntryPoint_1.default, account.network, account.keys));
    yield (0, submitUserOperationViaBundler_1.default)(yield userOp.unwrap(), account);
    (0, saveAccount_1.default)(account);
});
exports.default = finishInit;
