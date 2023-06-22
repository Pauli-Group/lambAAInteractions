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
const EntryPoint_1 = __importDefault(require("./EntryPoint"));
const loaders_1 = require("./loaders");
const submitUserOperationViaBundler = (userOp, account) => __awaiter(void 0, void 0, void 0, function* () {
    const [normalProvider, bundlerProvider] = (0, loaders_1.loadProviders)(account.chainName);
    const entryPoints = yield bundlerProvider.send("eth_supportedEntryPoints", []);
    console.log(`entryPoints: `, entryPoints);
    // send the userOp to the bundler
    const response = yield bundlerProvider.send("eth_sendUserOperation", [
        userOp,
        EntryPoint_1.default
    ]);
    console.log(`response: `, response);
});
exports.default = submitUserOperationViaBundler;
