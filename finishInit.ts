import KeyTrackerB from "lamportwalletmanager/src/KeyTrackerB"
import { address, bytes, uint256 } from "./SolidityTypes"
import { StandardMerkleTree } from "@openzeppelin/merkle-tree"
import { loadAccount } from "./loaders"
import ENTRYPOINT from "./EntryPoint"
import accountInterface from "./accountInterface"
import Monad from "./Monad"
import getInitCode from "./getInitCode"
import getNonce from "./getNonce"
import { BigNumber, ethers } from "ethers"
import { fillUserOpDefaults, lamportSignUserOp } from "./UserOperation"
import submitUserOperationViaBundler from "./submitUserOperationViaBundler"
import saveAccount from "./saveAccount"

type ExtraActivities = {
    dest: address[],
    value: uint256[],
    func: bytes[],
    estimatedAdditionalGas: uint256
}


const finishInit = async (_accountName: string, depositAmount: string, extraActivities: ExtraActivities | null = null) => {
    const oceKeyTracker = new KeyTrackerB()
    const oceKeyCount = 256
    const oceKeys = oceKeyTracker.more(oceKeyCount)

    const ocePKHs = oceKeys
        .map(k => k.pkh)
        .map((pkh: string) => [pkh]) // StandardMerkleTree expects an array of arrays

    const tree = StandardMerkleTree.of(ocePKHs, ["bytes32"])

    const account = await loadAccount(_accountName.toLowerCase())
    if (!account.oceKeys) {
        account.oceKeys = []
    }
    account.oceKeys.push(oceKeyTracker)

    // generate more account keys

    const additionalKeys = account.keys.more(30)
    const additionalKeyHashes = additionalKeys.map(k => k.pkh)

    /*
        Calls:
            1. deposit funds into the entry point
            2. endorse merkle root for off chain signatures
            3. add more keys
            4. call second initializer 
    */
    const dest: address[] = [
        ENTRYPOINT,
        account.counterfactual,
        account.counterfactual,
        account.counterfactual,
    ]
    const value: uint256[] = [
        depositAmount,
        0,
        0,
        0,
    ]
    const func: bytes[] = [
        '0x',
        accountInterface.encodeFunctionData('endorseMerkleRoot', [tree.root]),
        accountInterface.encodeFunctionData('addPublicKeyHashes', [additionalKeyHashes]),
        accountInterface.encodeFunctionData('initializePullPaymentsAndERC777Support', []),
    ]

    if (extraActivities !== null) {
        console.log("Extra activities detected")
        console.log(extraActivities)
        dest.push(...(extraActivities.dest))
        value.push(...(extraActivities.value))
        func.push(...(extraActivities.func))
    }

    const callData = accountInterface.encodeFunctionData('executeBatchWithValue', [
        dest,
        value,
        func,
    ])

    const userOp = Monad.of({
        sender: account.counterfactual,
        initCode: await getInitCode(account),
        callData: callData,
        nonce: await getNonce(account),
        callGasLimit: BigNumber.from(10_000_000).add(extraActivities?.estimatedAdditionalGas ?? 0),
    })
        .bind(fillUserOpDefaults)
        .bind((uo: any) => lamportSignUserOp(
            uo,
            ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath),
            ENTRYPOINT,
            account.network,
            account.keys,
        ))

    await submitUserOperationViaBundler(userOp.unwrap(), account)
    saveAccount(account)
}

export default finishInit
export type { ExtraActivities }