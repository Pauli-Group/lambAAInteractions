"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
require("dotenv/config");
const saveCounterfactualOrigin_1 = __importDefault(require("./saveCounterfactualOrigin"));
const KeyTrackerB_1 = __importDefault(require("lamportwalletmanager/src/KeyTrackerB"));
const loaders_1 = require("./loaders");
const bip39 = __importStar(require("bip39"));
function generateNewCounterfactual(blockchain, accountName) {
    return __awaiter(this, void 0, void 0, function* () {
        const [normalProvider, bundlerProvider] = (0, loaders_1.loadProviders)(blockchain.name);
        let mnemonic = bip39.generateMnemonic(256);
        const ecdsaSigner = ethers_1.ethers.Wallet.fromMnemonic(mnemonic).connect(normalProvider);
        const keys = new KeyTrackerB_1.default();
        const initialKeys = keys.more(20);
        const initialKeyHashes = initialKeys.map(k => k.pkh);
        const factory = (0, loaders_1.loadFactory)(blockchain.name);
        const counterfactual = yield factory.getAddress(ecdsaSigner.address, 0, initialKeyHashes);
        console.log(`Counterfactual address: ${counterfactual}`);
        (0, saveCounterfactualOrigin_1.default)(counterfactual, blockchain.factoryAddress, keys, initialKeyHashes, ecdsaSigner, (yield normalProvider.getNetwork()).chainId, blockchain.name, accountName, []);
        return counterfactual;
    });
}
exports.default = generateNewCounterfactual;
