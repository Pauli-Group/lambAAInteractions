"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blockchains = {
    'sepolia': {
        name: `sepolia`,
        bundlerRPC: `http://0.0.0.0:14337/11155111/`,
        normalRPC: `https://ethereum-sepolia.blockpi.network/v1/rpc/public`,
        factoryAddress: `0xC71cABfe1F58fb119a606122981C6Dd1ac1E3de1`,
        explorer: `https://sepolia.etherscan.com`,
    },
};
exports.default = blockchains;
