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
const EntryPoint_1 = __importDefault(require("./EntryPoint"));
const getDeposit_1 = __importDefault(require("./getDeposit"));
const loaders_1 = require("./loaders");
const sendEth_1 = __importDefault(require("./sendEth"));
const deposit = (_accountName, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield (0, loaders_1.loadAccount)(_accountName.toLowerCase());
    const depositBefore = yield (0, getDeposit_1.default)(account.counterfactual, account.chainName);
    const depositAsEther = ethers_1.ethers.utils.formatEther(depositBefore);
    console.log(`Deposit before: ${depositBefore}`);
    console.log(`Deposit before (ether): ${depositAsEther}`);
    yield (0, sendEth_1.default)(_accountName, EntryPoint_1.default, amount);
});
exports.default = deposit;
