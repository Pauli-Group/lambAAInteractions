import { BytesLike, ethers } from "ethers"
import { Account } from "./Account"
import { loadProviders } from "./loaders"
import LamportAccountFactoryJSON from './contracts/LamportAccountFactory.json'

export default async function getInitCode(account: Account): Promise<BytesLike> {
    const [normalProvider, bundlerProvider] = loadProviders(account.chainName)
    const code = await normalProvider.getCode(account.counterfactual)
    if (code !== '0x')
        return '0x'

    const factoryInterface = new ethers.utils.Interface(LamportAccountFactoryJSON.abi)

    return ethers.utils.hexConcat([
        account.factory,
        factoryInterface.encodeFunctionData('createAccount', [account.signerAddress, account.salt, account.initialKeyHashes])
    ])
}
