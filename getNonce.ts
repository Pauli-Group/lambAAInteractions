import { ethers } from "ethers"
import { Account } from "./Account"
import { uint256 } from "./SolidityTypes"
import { loadProviders } from "./loaders"
import ENTRYPOINT from "./EntryPoint"

export default async function getNonce(account: Account): Promise<uint256> {
    const [normalProvider, bundlerProvider] = loadProviders(account.chainName)
    const code = await normalProvider.getCode(account.counterfactual)
    if (code === '0x')
        return 0

    const entrypoint = new ethers.Contract(ENTRYPOINT, [
        'function getNonce(address, uint192) view returns (uint256)'
    ], normalProvider)
    const nonce = await entrypoint.getNonce(account.counterfactual, 0)
    return nonce.toNumber()
}
