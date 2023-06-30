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
const deposit_1 = __importDefault(require("./deposit"));
const addKeys_1 = __importDefault(require("./addKeys"));
const showAccount_1 = __importDefault(require("./showAccount"));
const sendEthAsync_1 = __importDefault(require("./sendEthAsync"));
const createAccount_1 = __importDefault(require("./createAccount"));
const sendEth_1 = __importDefault(require("./sendEth"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const submitCalldata_1 = __importDefault(require("./submitCalldata"));
const loaders_1 = require("./loaders");
const accountInterface_1 = __importDefault(require("./accountInterface"));
const Monad_1 = __importDefault(require("./Monad"));
const getNonce_1 = __importDefault(require("./getNonce"));
const UserOperation_1 = require("./UserOperation");
const ethers_1 = require("ethers");
const EntryPoint_1 = __importDefault(require("./EntryPoint"));
const submitUserOperationViaBundler_1 = __importDefault(require("./submitUserOperationViaBundler"));
const saveAccount_1 = __importDefault(require("./saveAccount"));
const getInitCode_1 = __importDefault(require("./getInitCode"));
const KeyTrackerB_1 = __importDefault(require("lamportwalletmanager/src/KeyTrackerB"));
const merkle_tree_1 = require("@openzeppelin/merkle-tree");
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
    .command('execute') // consider renaming to 'run' to avoid confusion with 'execute' in the contract
    .description('Execute a transaction on an account. The transaction is specified as a file')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'Calldata File')
    .action((_accountName, _calldataFile) => __awaiter(void 0, void 0, void 0, function* () {
    const calldata = yield fs_1.promises.readFile(path_1.default.resolve(_calldataFile), 'utf8');
    yield (0, submitCalldata_1.default)(_accountName, calldata);
}));
program
    .command('finish-init')
    .description('Finish the initialization of an account (adds support for ERC777 tokens and Eth Pull Payments)')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'Deposit Amount')
    .action((_accountName, depositAmount) => __awaiter(void 0, void 0, void 0, function* () {
    const oceKeyTracker = new KeyTrackerB_1.default();
    const oceKeyCount = 256;
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
    const callData = accountInterface_1.default.encodeFunctionData('executeBatchWithValue', [
        [
            EntryPoint_1.default,
            account.counterfactual,
            account.counterfactual,
            account.counterfactual,
        ],
        [
            depositAmount,
            0,
            0,
            0,
        ],
        [
            '0x',
            accountInterface_1.default.encodeFunctionData('endorseMerkleRoot', [tree.root]),
            accountInterface_1.default.encodeFunctionData('addPublicKeyHashes', [additionalKeyHashes]),
            accountInterface_1.default.encodeFunctionData('initializePullPaymentsAndERC777Support', []),
        ],
    ]);
    const userOp = Monad_1.default.of({
        sender: account.counterfactual,
        initCode: yield (0, getInitCode_1.default)(account),
        callData: callData,
        nonce: yield (0, getNonce_1.default)(account),
        callGasLimit: 10000000,
    })
        .bind(UserOperation_1.fillUserOpDefaults)
        .bind((uo) => (0, UserOperation_1.lamportSignUserOp)(uo, ethers_1.ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath), EntryPoint_1.default, account.network, account.keys));
    yield (0, submitUserOperationViaBundler_1.default)(userOp.unwrap(), account);
    (0, saveAccount_1.default)(account);
}));
program
    .command('auto-clean')
    .description('Ensure all pkhs which are marked safe to use are still safe to use. Mark all unsafe pkhs as unsafe (we will save a list of potytentually unsafe pkhs as we go)')
    .argument('<string>', 'Account Name')
    .action((_accountName) => __awaiter(void 0, void 0, void 0, function* () {
    // STEP 1: Get all currently available PKHs and check they are still redeemable on the contract
    // STEP 2: Get all PKHs we consider "unsafe" and mark them as redeemed if not already
}));
program.parse(process.argv);
