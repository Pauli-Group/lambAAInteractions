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
const accountInterface_1 = __importDefault(require("./accountInterface"));
const getNonce_1 = __importDefault(require("./getNonce"));
const getDeposit_1 = __importDefault(require("./getDeposit"));
const createAccount_1 = __importDefault(require("./createAccount"));
const sendEth_1 = __importDefault(require("./sendEth"));
const deposit_1 = __importDefault(require("./deposit"));
const addKeys_1 = __importDefault(require("./addKeys"));
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
program
    .command('add-keys')
    .description('Add keys to an account')
    .argument('<string>', 'Account Name')
    .action(addKeys_1.default);
program
    .command('show')
    .description('Show an account')
    .argument('<string>', 'Account Name')
    .action((_accountName) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield (0, loaders_1.loadAccount)(_accountName.toLowerCase());
    const [normalProvider, bundlerProvider] = (0, loaders_1.loadProviders)(account.chainName);
    const accountContract = new ethers_1.ethers.Contract(account.counterfactual, accountInterface_1.default, normalProvider);
    const balance = yield normalProvider.getBalance(account.counterfactual);
    const deposit = yield (0, getDeposit_1.default)(account.counterfactual, account.chainName);
    const entryPointAddress = yield accountContract.entryPoint().catch(() => 'Not Deployed');
    const code = yield normalProvider.getCode(account.counterfactual);
    const liveKeyCount = yield accountContract.liveKeyCount().catch(() => 'Not Deployed');
    const nonce = yield (0, getNonce_1.default)(account);
    const data = {
        counterfactual: account.counterfactual,
        balance: ethers_1.ethers.utils.formatEther(balance),
        deposit: ethers_1.ethers.utils.formatEther(deposit),
        'entry point': entryPointAddress,
        deployed: code === '0x' ? 'No' : 'Yes',
        'live key count': liveKeyCount === 'Not Deployed' ? liveKeyCount : liveKeyCount.toNumber(),
        nonce: nonce
    };
    console.table(data);
}));
program
    .command('auto-clean')
    .description('Ensure all pkhs which are marked safe to use are still safe to use. Mark all unsafe pkhs as unsafe (we will save a list of potytentually unsafe pkhs as we go)')
    .argument('<string>', 'Account Name')
    .action((_accountName) => __awaiter(void 0, void 0, void 0, function* () {
}));
program.parse(process.argv);
