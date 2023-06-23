import { ethers } from "ethers";
import ENTRYPOINT from "./EntryPoint";
import saveAccount from "./saveAccount";
import submitUserOperationViaBundler from "./submitUserOperationViaBundler";
import { fillUserOpDefaults, lamportSignUserOp } from "./UserOperation";
import getNonce from "./getNonce";
import Monad from "./Monad";
import accountInterface from "./accountInterface";
import getDeposit from "./getDeposit";
import getInitCode from "./getInitCode";
import { loadAccount } from "./loaders";

const deposit = async (_accountName: string, amount: string) => {

    const account = await loadAccount(_accountName.toLowerCase())
    const initCode = await getInitCode(account);
    const depositBefore = await getDeposit(account.counterfactual, account.chainName)
    console.log(`Deposit before: ${depositBefore}`)
    const depositAsEther = ethers.utils.formatEther(depositBefore)
    console.log(`Deposit before (ether): ${depositAsEther}`)

    const callData = accountInterface.encodeFunctionData('execute', [
        ENTRYPOINT,
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

export default deposit