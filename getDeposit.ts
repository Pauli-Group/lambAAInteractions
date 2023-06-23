import { ethers } from "ethers"
import { address } from "./SolidityTypes"
import { loadChain, loadProviders } from "./loaders"
import ENTRYPOINT from "./EntryPoint"
import EntryPointJSON from './contracts/EntryPoint.json'

const getDeposit = async (adrs : address, chainName : string) => {
    const blockchain = loadChain(chainName)
    const provider = loadProviders(blockchain.name)[0]
    const entryPoint = new ethers.Contract(ENTRYPOINT, EntryPointJSON.abi, provider)
    const deposit = await entryPoint.balanceOf(adrs)
    return deposit
}

export default getDeposit