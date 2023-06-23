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
const generateNewCounterfactual_1 = __importDefault(require("./generateNewCounterfactual"));
const loaders_1 = require("./loaders");
const createAccount = (_chainName, _accountName) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.default = createAccount;
