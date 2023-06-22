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
const EntryPoint_1 = __importDefault(require("./EntryPoint"));
function getNonce(account) {
    return __awaiter(this, void 0, void 0, function* () {
        const [normalProvider, bundlerProvider] = (0, loaders_1.loadProviders)(account.chainName);
        const code = yield normalProvider.getCode(account.counterfactual);
        if (code === '0x')
            return 0;
        const entrypoint = new ethers_1.ethers.Contract(EntryPoint_1.default, [
            'function getNonce(address, uint192) view returns (uint256)'
        ], normalProvider);
        const nonce = yield entrypoint.getNonce(account.counterfactual, 0);
        return nonce.toNumber();
    });
}
exports.default = getNonce;
