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
const createAccount_1 = __importDefault(require("./createAccount"));
const sendEth_1 = __importDefault(require("./sendEth"));
const deposit_1 = __importDefault(require("./deposit"));
const addKeys_1 = __importDefault(require("./addKeys"));
const showAccount_1 = __importDefault(require("./showAccount"));
const sendEthAsync_1 = __importDefault(require("./sendEthAsync"));
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
    .action(showAccount_1.default);
program
    .command('send-eth-async')
    .description('Send ETH to an account using pull payments')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'To Address')
    .argument('<string>', 'Amount')
    .action(sendEthAsync_1.default);
program
    .command('auto-clean')
    .description('Ensure all pkhs which are marked safe to use are still safe to use. Mark all unsafe pkhs as unsafe (we will save a list of potytentually unsafe pkhs as we go)')
    .argument('<string>', 'Account Name')
    .action((_accountName) => __awaiter(void 0, void 0, void 0, function* () {
}));
program.parse(process.argv);
