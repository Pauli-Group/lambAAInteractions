import { BigNumber, ethers } from "ethers";
import ENTRYPOINT from "./EntryPoint";
import Monad, { AsyncMonad } from "./Monad";
import { UserOperation, ecdsaSign, estimateGas, fillUserOpDefaults, fillUserOpDefaultsAsync, gasMult, getUserOpHash, lamportSignUserOp, lamportSignUserOpAsync, show, stub } from "./UserOperation";
import accountInterface from "./accountInterface";
import getInitCode from "./getInitCode";
import getNonce from "./getNonce";
import { loadAccount, loadProviders } from "./loaders";
import submitUserOperationViaBundler from "./submitUserOperationViaBundler";
import saveAccount from "./saveAccount";
import KeyTrackerB from "lamportwalletmanager/src/KeyTrackerB";
import { sign_hash } from "lamportwalletmanager/src";

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

    const estimateGasWithAccount = estimateGas.bind(null, account)

    const userOp = AsyncMonad.of({
        sender: account.counterfactual,
        initCode: initCode,
        callData: callData,
        nonce: await getNonce(account),
    })
        .bind(fillUserOpDefaultsAsync)
        .bind(estimateGasWithAccount)
        .bind(gasMult(2))
        .bind(stub((op : UserOperation) => console.log("Estimated total gas is", BigNumber.from(op?.callGasLimit).add(op?.preVerificationGas).add(op?.verificationGasLimit).toString())))
        .bind((uo: any) => lamportSignUserOpAsync(
            uo,
            ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath),
            ENTRYPOINT,
            account.network,
            account.keys
        ))

    console.log(`User operation sig len is: `, (await userOp.unwrap()).signature.length)

    await submitUserOperationViaBundler(await userOp.unwrap(), account)
    saveAccount(account)
}

export default sendEth

