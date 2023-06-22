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
const loaders_1 = require("./loaders");
const LamportAccountFactory_json_1 = __importDefault(require("./contracts/LamportAccountFactory.json"));
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
exports.default = getInitCode;
