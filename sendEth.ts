import { ethers } from "ethers";
import ENTRYPOINT from "./EntryPoint";
import Monad from "./Monad";
import { fillUserOpDefaults, lamportSignUserOp, show } from "./UserOperation";
import accountInterface from "./accountInterface";
import getInitCode from "./getInitCode";
import getNonce from "./getNonce";
import { loadAccount } from "./loaders";
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

    const userOp = Monad.of({
        sender: account.counterfactual,
        initCode: initCode,
        callData: callData,
        nonce: await getNonce(account),
    })
        .bind(fillUserOpDefaults)
        .bind((uo: any) => lamportSignUserOp(
            uo,
            ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath),
            ENTRYPOINT,
            account.network,
            account.keys
        ))

    await submitUserOperationViaBundler(userOp.unwrap(), account)
    saveAccount(account)
}

export default sendEth