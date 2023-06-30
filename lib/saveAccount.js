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
const saveCounterfactualOrigin_1 = __importDefault(require("./saveCounterfactualOrigin"));
const saveAccount = (account) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, saveCounterfactualOrigin_1.default)(account.counterfactual, account.factory, account.keys, account.initialKeyHashes, ethers_1.ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath), account.network, account.chainName, account.accountName, account.oceKeys || []);
});
exports.default = saveAccount;
