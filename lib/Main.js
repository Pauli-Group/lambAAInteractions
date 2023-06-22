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
const commander_1 = require("commander");
require("dotenv/config");
const ethers_1 = require("ethers");
const loaders_1 = require("./loaders");
const generateNewCounterfactual_1 = __importDefault(require("./generateNewCounterfactual"));
const Monad_1 = __importDefault(require("./Monad"));
const accountInterface_1 = __importDefault(require("./accountInterface"));
const UserOperation_1 = require("./UserOperation");
const saveAccount_1 = __importDefault(require("./saveAccount"));
const getInitCode_1 = __importDefault(require("./getInitCode"));
const EntryPoint_1 = __importDefault(require("./EntryPoint"));
const getNonce_1 = __importDefault(require("./getNonce"));
const submitUserOperationViaBundler_1 = __importDefault(require("./submitUserOperationViaBundler"));
const EntryPoint_json_1 = __importDefault(require("./contracts/EntryPoint.json"));
const program = new commander_1.Command();
program
    .command('create-account')
    .description('Create a new account')
    .argument('<string>', 'Chain Name')
    .argument('<string>', 'Account Name')
    .action((_chainName, _accountName) => __awaiter(void 0, void 0, void 0, function* () {
    const chainName = _chainName.toLowerCase();
    const accountName = _accountName.toLowerCase();
    const blockchain = (0, loaders_1.loadChain)(chainName);
    // Create an account (counterfactual only) and report the name, address, chain
    const counterfactual = yield (0, generateNewCounterfactual_1.default)(blockchain, accountName);
    console.table({
        "Account Name": accountName,
        "Counterfactual Address": counterfactual,
        "Chain": blockchain.name,
    });
}));
const getDeposit = (adrs, chainName) => __awaiter(void 0, void 0, void 0, function* () {
    const blockchain = (0, loaders_1.loadChain)(chainName);
    const provider = (0, loaders_1.loadProviders)(blockchain.name)[0];
    const entryPoint = new ethers_1.ethers.Contract(EntryPoint_1.default, EntryPoint_json_1.default.abi, provider);
    const deposit = yield entryPoint.balanceOf(adrs);
    return deposit;
});
program
    .command('deposit')
    .description('Deposit funds into the entry point to continute paying the prefund')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'Amount')
    .action((_accountName, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield (0, loaders_1.loadAccount)(_accountName.toLowerCase());
    const initCode = yield (0, getInitCode_1.default)(account);
    const depositBefore = yield getDeposit(account.counterfactual, account.chainName);
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
}));
program
    .command('send-eth')
    .description('Send ETH to an account')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'To Address')
    .argument('<string>', 'Amount')
    .action((_accountName, toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
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
    const userOp = Monad_1.default.of({
        sender: account.counterfactual,
        initCode: initCode,
        callData: callData,
        nonce: yield (0, getNonce_1.default)(account),
    })
        .bind(UserOperation_1.fillUserOpDefaults)
        .bind((uo) => (0, UserOperation_1.lamportSignUserOp)(uo, ethers_1.ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath), EntryPoint_1.default, account.network, account.keys))
        .bind(UserOperation_1.show);
    yield (0, submitUserOperationViaBundler_1.default)(userOp.unwrap(), account);
    (0, saveAccount_1.default)(account);
}));
program
    .command('add-keys')
    .description('Add keys to an account')
    .argument('<string>', 'Account Name')
    .action((_accountName) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield (0, loaders_1.loadAccount)(_accountName.toLowerCase());
    const initCode = yield (0, getInitCode_1.default)(account);
    if (initCode !== '0x') {
        console.error(`First Transaction must pay prefund by sending eth to ${EntryPoint_1.default}`);
        process.exit(1);
    }
    const additionalKeys = account.keys.more(30);
    const additionalKeyHashes = additionalKeys.map(k => k.pkh);
    const callData = accountInterface_1.default.encodeFunctionData('addPublicKeyHashes', [
        additionalKeyHashes
    ]);
    const userOp = Monad_1.default.of({
        sender: account.counterfactual,
        initCode: initCode,
        callData: callData,
        nonce: yield (0, getNonce_1.default)(account),
        callGasLimit: 10000000
    })
        .bind(UserOperation_1.fillUserOpDefaults)
        .bind((uo) => (0, UserOperation_1.lamportSignUserOp)(uo, ethers_1.ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath), EntryPoint_1.default, account.network, account.keys));
    // .bind(show)
    yield (0, submitUserOperationViaBundler_1.default)(userOp.unwrap(), account);
    (0, saveAccount_1.default)(account);
}));
program.parse(process.argv);
