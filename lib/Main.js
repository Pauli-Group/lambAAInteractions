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
const LamportAccountFactory_json_1 = __importDefault(require("./contracts/LamportAccountFactory.json"));
const generateNewCounterfactual_1 = __importDefault(require("./generateNewCounterfactual"));
const Monad_1 = __importDefault(require("./Monad"));
const accountInterface_1 = __importDefault(require("./accountInterface"));
const UserOperation_1 = require("./UserOperation");
const saveCounterfactualOrigin_1 = __importDefault(require("./saveCounterfactualOrigin"));
const program = new commander_1.Command();
const ENTRYPOINT = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';
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
function getInitCode(account) {
    return __awaiter(this, void 0, void 0, function* () {
        const [normalProvider, bundlerProvider] = (0, loaders_1.loadProviders)(account.chainName);
        const code = yield normalProvider.getCode(account.counterfactual);
        if (code !== '0x')
            return '0x';
        const factoryInterface = new ethers_1.ethers.utils.Interface(LamportAccountFactory_json_1.default.abi);
        return ethers_1.ethers.utils.hexConcat([
            account.factory,
            factoryInterface.encodeFunctionData('createAccount', [account.signerAddress, account.salt, account.initialKeyHashes])
        ]);
    });
}
const submitUserOperationViaBundler = (userOp) => __awaiter(void 0, void 0, void 0, function* () {
    // May need to better fund relayer before this will work
    // const bundlerRpc = `http://0.0.0.0:14337/80001/`
    const bundlerRpc = `http://0.0.0.0:14337/11155111/`;
    // const bundlerRpc = `https://api.stackup.sh/v1/node/e9b394ee43e6df1fb608d6f321a726ddcf46096145ad4afabc5c8716dba9bea0`
    const bundlerProvider = new ethers_1.ethers.providers.JsonRpcProvider(bundlerRpc);
    const entryPoints = yield bundlerProvider.send("eth_supportedEntryPoints", []);
    console.log(`entryPoints: `, entryPoints);
    // send the userOp to the bundler
    const response = yield bundlerProvider.send("eth_sendUserOperation", [
        userOp,
        ENTRYPOINT
    ]);
    console.log(`response: `, response);
});
function getNonce(account) {
    return __awaiter(this, void 0, void 0, function* () {
        const [normalProvider, bundlerProvider] = (0, loaders_1.loadProviders)(account.chainName);
        const code = yield normalProvider.getCode(account.counterfactual);
        if (code === '0x')
            return 0;
        const entrypoint = new ethers_1.ethers.Contract(ENTRYPOINT, [
            'function getNonce(address, uint192) view returns (uint256)'
        ], normalProvider);
        const nonce = yield entrypoint.getNonce(account.counterfactual, 0);
        return nonce.toNumber();
    });
}
const saveAccount = (account) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, saveCounterfactualOrigin_1.default)(account.counterfactual, account.factory, account.keys, account.initialKeyHashes, ethers_1.ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath), account.network, account.chainName, account.accountName);
});
program
    .command('send-eth')
    .description('Send ETH to an account')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'To Address')
    .argument('<string>', 'Amount')
    .action((_accountName, toAddress, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield (0, loaders_1.loadAccount)(_accountName);
    console.log(account);
    const callData = accountInterface_1.default.encodeFunctionData('execute', [
        toAddress,
        amount,
        '0x'
    ]);
    const initCode = yield getInitCode(account);
    if ((initCode !== '0x') && (toAddress !== ENTRYPOINT)) {
        console.error(`First Transaction must pay prefund by sending eth to ${ENTRYPOINT}`);
        process.exit(1);
    }
    const userOp = Monad_1.default.of({
        sender: account.counterfactual,
        initCode: initCode,
        callData: callData,
        nonce: yield getNonce(account),
    })
        .bind(UserOperation_1.fillUserOpDefaults)
        .bind((uo) => (0, UserOperation_1.lamportSignUserOp)(uo, ethers_1.ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath), ENTRYPOINT, account.network, account.keys))
        .bind(UserOperation_1.show);
    yield submitUserOperationViaBundler(userOp.unwrap());
    const [normalProvider, bundlerProvider] = (0, loaders_1.loadProviders)(account.chainName);
    saveAccount(account);
}));
program
    .command('add-keys')
    .description('Add keys to an account')
    .argument('<string>', 'Account Name')
    .action((accountName) => __awaiter(void 0, void 0, void 0, function* () {
}));
program.parse(process.argv);
