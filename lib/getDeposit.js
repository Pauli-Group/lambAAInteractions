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
const EntryPoint_json_1 = __importDefault(require("./contracts/EntryPoint.json"));
const getDeposit = (adrs, chainName) => __awaiter(void 0, void 0, void 0, function* () {
    const blockchain = (0, loaders_1.loadChain)(chainName);
    const provider = (0, loaders_1.loadProviders)(blockchain.name)[0];
    const entryPoint = new ethers_1.ethers.Contract(EntryPoint_1.default, EntryPoint_json_1.default.abi, provider);
    const deposit = yield entryPoint.balanceOf(adrs);
    return deposit;
});
exports.default = getDeposit;
