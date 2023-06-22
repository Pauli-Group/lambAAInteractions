import { Account } from "./Account"
import ENTRYPOINT from "./EntryPoint"
import { UserOperation } from "./UserOperation"
import { loadProviders } from "./loaders"


const submitUserOperationViaBundler = async (userOp: UserOperation, account : Account ) => {
    const [normalProvider, bundlerProvider] = loadProviders(account.chainName)
    const entryPoints = await bundlerProvider.send("eth_supportedEntryPoints", [])
    console.log(`entryPoints: `, entryPoints)

    // send the userOp to the bundler
    const response = await bundlerProvider.send("eth_sendUserOperation", [
        userOp,
        ENTRYPOINT
    ])

    console.log(`response: `, response)
}

export default submitUserOperationViaBundler
