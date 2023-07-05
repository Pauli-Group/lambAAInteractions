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
const Monad_1 = require("./Monad");
const UserOperation_1 = require("./UserOperation");
const accountInterface_1 = __importDefault(require("./accountInterface"));
const getInitCode_1 = __importDefault(require("./getInitCode"));
const getNonce_1 = __importDefault(require("./getNonce"));
const loaders_1 = require("./loaders");
const submitUserOperationViaBundler_1 = __importDefault(require("./submitUserOperationViaBundler"));
const saveAccount_1 = __importDefault(require("./saveAccount"));
const sendEth = (_accountName, toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield (0, loaders_1.loadAccount)(_accountName.toLowerCase());
    const initCode = yield (0, getInitCode_1.default)(account);
    if ((initCode !== '0x') && (toAddress !== EntryPoint_1.default)) {
        console.error(`First Transaction must pay prefund by sending eth to ${EntryPoint_1.default}`);
        process.exit(1);
    }
    const callData = accountInterface_1.default.encodeFunctionData('execute', [
        toAddress,
        amount,
        '0x'
    ]);
    // const estimateGas = async (op: Partial<UserOperation>): Promise<AsyncMonad<Partial<UserOperation>>> => {
    const estimateGas = (op) => __awaiter(void 0, void 0, void 0, function* () {
        const [normalProvider, bundlerProvider] = (0, loaders_1.loadProviders)(account.chainName);
        const est = yield bundlerProvider.send('eth_estimateUserOperationGas', [op, EntryPoint_1.default]);
        console.log(`Estimate gas: `, est);
        return Monad_1.AsyncMonad.of(op);
    });
    const userOp = Monad_1.AsyncMonad.of({
        sender: account.counterfactual,
        initCode: initCode,
        callData: callData,
        nonce: yield (0, getNonce_1.default)(account),
    })
        .bind(UserOperation_1.fillUserOpDefaultsAsync)
        .bind((uo) => (0, UserOperation_1.lamportSignUserOpAsync)(uo, ethers_1.ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath), EntryPoint_1.default, account.network, account.keys))
        .bind(estimateGas)
        .bind((uo) => (0, UserOperation_1.lamportSignUserOpAsync)(uo, ethers_1.ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath), EntryPoint_1.default, account.network, account.keys));
    console.log(`User operation is: `, yield userOp.unwrap());
    yield (0, submitUserOperationViaBundler_1.default)(yield userOp.unwrap(), account);
    (0, saveAccount_1.default)(account);
});
exports.default = sendEth;
