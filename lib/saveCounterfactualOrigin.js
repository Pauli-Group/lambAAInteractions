"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function saveCounterfactualOrigin(counterfactual, factoryAddress, keys, initialKeyHashes, ecdsaSigner, chainId, chainName, accountName) {
    const originFile = `accounts/${accountName}_${counterfactual}.json`; // date first so its easier to sort.. counterfactual ddress for searching
    const originObject = {
        counterfactual: counterfactual,
        factory: factoryAddress,
        keys: keys,
        initialKeyHashes: initialKeyHashes,
        signerAddress: ecdsaSigner.address,
        salt: 0,
        network: chainId,
        chainName: chainName,
        ecdsaSecret: ecdsaSigner.mnemonic.phrase,
        ecdsaPath: ecdsaSigner.mnemonic.path,
        accountName: accountName,
    };
    if (!fs_1.default.existsSync('accounts')) {
        fs_1.default.mkdirSync('accounts');
    }
    fs_1.default.writeFileSync(originFile, JSON.stringify(originObject, null, 2));
    console.log(`Keys saved to ${originFile}`);
}
exports.default = saveCounterfactualOrigin;
