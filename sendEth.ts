import { ethers } from "ethers";
import ENTRYPOINT from "./EntryPoint";
import Monad, { AsyncMonad } from "./Monad";
import { UserOperation, fillUserOpDefaults, fillUserOpDefaultsAsync, lamportSignUserOp, lamportSignUserOpAsync, show } from "./UserOperation";
import accountInterface from "./accountInterface";
import getInitCode from "./getInitCode";
import getNonce from "./getNonce";
import { loadAccount, loadProviders } from "./loaders";
import submitUserOperationViaBundler from "./submitUserOperationViaBundler";
import saveAccount from "./saveAccount";

const sendEth = async (_accountName: string, toAddress: string, amount: string) => {
    const account = await loadAccount(_accountName.toLowerCase())
    const initCode = await getInitCode(account);

    if ((initCode !== '0x') && (toAddress !== ENTRYPOINT)) {
        console.error(`First Transaction must pay prefund by sending eth to ${ENTRYPOINT}`)
        process.exit(1)
    }

    const callData = accountInterface.encodeFunctionData('execute', [
        toAddress,
        amount,
        '0x'
    ])

    const estimateGas = async (op: Partial<UserOperation>): Promise<AsyncMonad<Partial<UserOperation>>> => {
        const [normalProvider, bundlerProvider] = loadProviders(account.chainName)
        const est = await bundlerProvider.send('eth_estimateUserOperationGas', [op, ENTRYPOINT])
        console.log(`Estimate gas: `, est)
        return AsyncMonad.of(op)
    }
    
    const userOp = AsyncMonad.of({
        sender: account.counterfactual,
        initCode: initCode,
        callData: callData,
        nonce: await getNonce(account),
    })
        .bind(fillUserOpDefaultsAsync)
        .bind((uo: any) => lamportSignUserOpAsync(
            uo,
            ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath),
            ENTRYPOINT,
            account.network,
            account.keys
        ))
        .bind(estimateGas)  
   
    console.log(`User operation is: `, await userOp.unwrap())

    await submitUserOperationViaBundler(await userOp.unwrap(), account)
    saveAccount(account)
}

export default sendEth