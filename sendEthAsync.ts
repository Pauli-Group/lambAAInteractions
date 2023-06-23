import { ethers } from "ethers";
import Monad from "./Monad";
import { fillUserOpDefaults, lamportSignUserOp, show } from "./UserOperation";
import saveAccount from "./saveAccount";
import submitUserOperationViaBundler from "./submitUserOperationViaBundler";
import ENTRYPOINT from "./EntryPoint";
import getNonce from "./getNonce";
import accountInterface from "./accountInterface";
import { loadAccount } from "./loaders";
import getInitCode from "./getInitCode";

const sendEthAsync = async (_accountName: string, toAddress: string, amount: string) => {
    const account = await loadAccount(_accountName.toLowerCase())
    const initCode = await getInitCode(account);

    if ((initCode !== '0x') && (toAddress !== ENTRYPOINT)) {
        console.error(`First Transaction must pay prefund by sending eth to ${ENTRYPOINT}`)
        process.exit(1)
    }

    const callData = accountInterface.encodeFunctionData('asyncTransfer', [
        toAddress,
        amount,
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

export default sendEthAsync