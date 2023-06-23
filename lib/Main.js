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
const Monad_1 = __importDefault(require("./Monad"));
const accountInterface_1 = __importDefault(require("./accountInterface"));
const UserOperation_1 = require("./UserOperation");
const saveAccount_1 = __importDefault(require("./saveAccount"));
const getInitCode_1 = __importDefault(require("./getInitCode"));
const EntryPoint_1 = __importDefault(require("./EntryPoint"));
const getNonce_1 = __importDefault(require("./getNonce"));
const submitUserOperationViaBundler_1 = __importDefault(require("./submitUserOperationViaBundler"));
const createAccount_1 = __importDefault(require("./createAccount"));
const sendEth_1 = __importDefault(require("./sendEth"));
const deposit_1 = __importDefault(require("./deposit"));
const program = new commander_1.Command();
program
    .command('create-account')
    .description('Create a new account')
    .argument('<string>', 'Chain Name')
    .argument('<string>', 'Account Name')
    .action(createAccount_1.default);
program
    .command('deposit')
    .description('Deposit funds into the entry point to continute paying the prefund')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'Amount')
    .action(deposit_1.default);
program
    .command('send-eth')
    .description('Send ETH to an account')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'To Address')
    .argument('<string>', 'Amount')
    .action(sendEth_1.default);
const addKeys = (_accountName) => __awaiter(void 0, void 0, void 0, function* () {
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
    yield (0, submitUserOperationViaBundler_1.default)(userOp.unwrap(), account);
    (0, saveAccount_1.default)(account);
});
program
    .command('add-keys')
    .description('Add keys to an account')
    .argument('<string>', 'Account Name')
    .action(addKeys);
program
    .command('auto-clean')
    .description('Ensure all pkhs which are marked safe to use are still safe to use. Mark all unsafe pkhs as unsafe (we will save a list of potytentually unsafe pkhs as we go)')
    .argument('<string>', 'Account Name')
    .action((_accountName) => __awaiter(void 0, void 0, void 0, function* () {
}));
program.parse(process.argv);
