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
const ethers_1 = require("ethers");
const EntryPoint_1 = __importDefault(require("./EntryPoint"));
const saveAccount_1 = __importDefault(require("./saveAccount"));
const submitUserOperationViaBundler_1 = __importDefault(require("./submitUserOperationViaBundler"));
const UserOperation_1 = require("./UserOperation");
const getNonce_1 = __importDefault(require("./getNonce"));
const Monad_1 = __importDefault(require("./Monad"));
const accountInterface_1 = __importDefault(require("./accountInterface"));
const getDeposit_1 = __importDefault(require("./getDeposit"));
const getInitCode_1 = __importDefault(require("./getInitCode"));
const loaders_1 = require("./loaders");
const deposit = (_accountName, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield (0, loaders_1.loadAccount)(_accountName.toLowerCase());
    const initCode = yield (0, getInitCode_1.default)(account);
    const depositBefore = yield (0, getDeposit_1.default)(account.counterfactual, account.chainName);
    console.log(`Deposit before: ${depositBefore}`);
    const depositAsEther = ethers_1.ethers.utils.formatEther(depositBefore);
    console.log(`Deposit before (ether): ${depositAsEther}`);
    const callData = accountInterface_1.default.encodeFunctionData('execute', [
        EntryPoint_1.default,
        amount,
        '0x'
    ]);
    const userOp = Monad_1.default.of({
        sender: account.counterfactual,
        initCode: initCode,
        callData: callData,
        nonce: yield (0, getNonce_1.default)(account),
    })
        .bind(UserOperation_1.fillUserOpDefaults)
        .bind((uo) => (0, UserOperation_1.lamportSignUserOp)(uo, ethers_1.ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath), EntryPoint_1.default, account.network, account.keys));
    yield (0, submitUserOperationViaBundler_1.default)(userOp.unwrap(), account);
    (0, saveAccount_1.default)(account);
});
exports.default = deposit;
