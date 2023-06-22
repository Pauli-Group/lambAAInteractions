import { ethers } from "ethers"
import { Account } from "./Account"
import saveCounterfactualOrigin from "./saveCounterfactualOrigin"

const saveAccount = async (account: Account) => saveCounterfactualOrigin(
    account.counterfactual,
    account.factory,
    account.keys,
    account.initialKeyHashes,
    ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath),
    account.network,
    account.chainName,
    account.accountName
)

export default saveAccount