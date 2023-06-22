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
exports.loadAccount = exports.loadFactory = exports.loadProviders = exports.loadChain = void 0;
const ethers_1 = require("ethers");
const blockchainOptions_1 = __importDefault(require("./blockchainOptions"));
const fs_1 = require("fs");
const LamportAccountFactory_json_1 = __importDefault(require("./contracts/LamportAccountFactory.json"));
const KeyTrackerB_1 = __importDefault(require("lamportwalletmanager/src/KeyTrackerB"));
function loadChain(chainName) {
    const chain = blockchainOptions_1.default[chainName];
    if (!chain) {
        console.error(`Chain "${chainName}" not found. Exiting.`);
        process.exit(1);
    }
    return chain;
}
exports.loadChain = loadChain;
function loadProviders(chainName) {
    const chain = loadChain(chainName);
    return [
        new ethers_1.ethers.providers.JsonRpcProvider(chain.normalRPC),
        new ethers_1.ethers.providers.JsonRpcProvider(chain.bundlerRPC),
    ];
}
exports.loadProviders = loadProviders;
function loadFactory(chainName) {
    const chain = loadChain(chainName);
    const abi = LamportAccountFactory_json_1.default.abi;
    const iface = new ethers_1.ethers.utils.Interface(abi);
    return new ethers_1.ethers.Contract(chain.factoryAddress, iface, loadProviders(chainName)[0]);
}
exports.loadFactory = loadFactory;
function loadAccount(accountName) {
    return __awaiter(this, void 0, void 0, function* () {
        const accountsDirectory = 'accounts';
        let filenames;
        // Read accounts directory
        try {
            filenames = yield fs_1.promises.readdir(accountsDirectory);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                // If the accounts directory does not exist yet, that's not a problem
                console.error(`No accounts found with that name or any other. Exiting.`);
                process.exit(1);
            }
            else {
                throw error;
            }
        }
        // Find account with the given nickname
        function findFilename(accountName, filenames) {
            const match = filenames.find(filename => filename.match(new RegExp(`^${accountName}_`)));
            if (match) {
                return match;
            }
            else {
                console.error(`No file found for account ${accountName}`);
                process.exit(1);
            }
        }
        const accountFilename = 'accounts/' + findFilename(accountName, filenames);
        if (!accountFilename) {
            console.error(`No accounts found with that name. Exiting.`);
            process.exit(1);
        }
        const selectedAccountContent = yield fs_1.promises.readFile(accountFilename, 'utf8');
        const selectedAccount = JSON.parse(selectedAccountContent);
        const kt = Object.assign(new KeyTrackerB_1.default(), JSON.parse(JSON.stringify(selectedAccount.keys)));
        return Object.assign(Object.assign({}, selectedAccount), { keys: kt });
    });
}
exports.loadAccount = loadAccount;
