import generateNewCounterfactual from "./generateNewCounterfactual"
import { loadChain } from "./loaders"

const createAccount = async (_chainName : string, _accountName : string) => {
    const chainName = _chainName.toLowerCase()
    const accountName = _accountName.toLowerCase()

    const blockchain = loadChain(chainName)

    // Create an account (counterfactual only) and report the name, address, chain
    const counterfactual = await generateNewCounterfactual(blockchain, accountName)

    console.table({
        "Account Name": accountName,
        "Counterfactual Address": counterfactual,
        "Chain": blockchain.name,
    })
}

export default createAccount