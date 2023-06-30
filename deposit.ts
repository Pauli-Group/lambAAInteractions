import { ethers } from "ethers";
import ENTRYPOINT from "./EntryPoint";
import getDeposit from "./getDeposit";
import { loadAccount } from "./loaders";
import sendEth from "./sendEth";

const deposit = async (_accountName: string, amount: string) => {
    const account = await loadAccount(_accountName.toLowerCase())
    const depositBefore = await getDeposit(account.counterfactual, account.chainName)
    const depositAsEther = ethers.utils.formatEther(depositBefore)

    console.log(`Deposit before: ${depositBefore}`)
    console.log(`Deposit before (ether): ${depositAsEther}`)

    await sendEth(_accountName, ENTRYPOINT, amount)
}

export default deposit