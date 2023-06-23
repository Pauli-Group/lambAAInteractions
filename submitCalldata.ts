import { ethers } from "ethers";
import ENTRYPOINT from "./EntryPoint";
import saveAccount from "./saveAccount";
import submitUserOperationViaBundler from "./submitUserOperationViaBundler";
import Monad from "./Monad";
import getInitCode from "./getInitCode";
import { loadAccount } from "./loaders";
import getNonce from "./getNonce";
import { fillUserOpDefaults, lamportSignUserOp } from "./UserOperation";
import { bytes } from "./SolidityTypes";

const submitCalldata = async (_accountName: string, calldata: bytes) => {
    const account = await loadAccount(_accountName.toLowerCase())
    const initCode = await getInitCode(account);
    const userOp = Monad.of({
        sender: account.counterfactual,
        initCode: initCode,
        callData: calldata,
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

export default submitCalldata