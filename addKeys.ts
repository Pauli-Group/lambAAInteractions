import { ethers } from "ethers";
import ENTRYPOINT from "./EntryPoint";
import Monad from "./Monad";
import { fillUserOpDefaults, lamportSignUserOp } from "./UserOperation";
import accountInterface from "./accountInterface";
import getInitCode from "./getInitCode";
import getNonce from "./getNonce";
import { loadAccount } from "./loaders";
import submitUserOperationViaBundler from "./submitUserOperationViaBundler";
import saveAccount from "./saveAccount";

const addKeys = async (_accountName: string) => {
    const account = await loadAccount(_accountName.toLowerCase())
    const initCode = await getInitCode(account);

    if (initCode !== '0x') {
        console.error(`First Transaction must pay prefund by sending eth to ${ENTRYPOINT}`)
        process.exit(1)
    }

    const additionalKeys = account.keys.more(30)
    const additionalKeyHashes = additionalKeys.map(k => k.pkh)

    const callData = accountInterface.encodeFunctionData('addPublicKeyHashes', [
        additionalKeyHashes
    ])

    const userOp = Monad.of({
        sender: account.counterfactual,
        initCode: initCode,
        callData: callData,
        nonce: await getNonce(account),
        callGasLimit: 10_000_000
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

export default addKeys