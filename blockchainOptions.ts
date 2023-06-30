import { Blockchains } from "./Blockchains"

const blockchains : Blockchains = {
    'sepolia': {
        name: `sepolia`,
        bundlerRPC: `http://0.0.0.0:14337/11155111/`,
        normalRPC:  `https://ethereum-sepolia.blockpi.network/v1/rpc/public`,
        // factoryAddress: `0xC71cABfe1F58fb119a606122981C6Dd1ac1E3de1`,
        factoryAddress: `0x7AB1135013e119496a823e2E28C7CC9eA4A566EF`,
        explorer: `https://sepolia.etherscan.com`,
    },
}

export default blockchains