import { ethers } from "ethers"
import { loadAccount, loadProviders } from "./loaders"
import getDeposit from "./getDeposit"
import getNonce from "./getNonce"
import accountInterface from "./accountInterface"

const showAccount = async (_accountName: string) => {
    const account = await loadAccount(_accountName.toLowerCase())
    const [normalProvider, bundlerProvider] = loadProviders(account.chainName)
    const accountContract = new ethers.Contract(account.counterfactual, accountInterface, normalProvider)

    const balance = await normalProvider.getBalance(account.counterfactual)
    const deposit = await getDeposit(account.counterfactual, account.chainName)

    const entryPointAddress = await accountContract.entryPoint().catch(() => 'Not Deployed')

    const code = await normalProvider.getCode(account.counterfactual)
    const liveKeyCount = await accountContract.liveKeyCount().catch(() => 'Not Deployed')

    const nonce = await getNonce(account)

    const data = {
        counterfactual: account.counterfactual,
        balance: ethers.utils.formatEther(balance),
        deposit: ethers.utils.formatEther(deposit),
        'entry point': entryPointAddress,
        deployed: code === '0x' ? 'No' : 'Yes',
        'live key count': liveKeyCount === 'Not Deployed' ? liveKeyCount : liveKeyCount.toNumber(),
        nonce: nonce
    }
    console.table(data)
}

export default showAccount