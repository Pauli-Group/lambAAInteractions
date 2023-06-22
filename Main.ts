import { Command } from 'commander'
import "dotenv/config"
import { BytesLike, ethers } from 'ethers'
import { type Blockchain } from './Blockchain'
import { loadAccount, loadChain, loadProviders } from './loaders'
import { promises as fs } from 'fs';
import path from 'path';
import generateNewCounterfactual from './generateNewCounterfactual'
import { type } from 'os'
import { address, uint256 } from './SolidityTypes'
import LamportWalletManager, { KeyTracker } from 'lamportwalletmanager'
import KeyTrackerB from 'lamportwalletmanager/src/KeyTrackerB'
import Monad from './Monad'
import { type Account } from './Account'
import accountInterface from './accountInterface'
import { UserOperation, fillUserOpDefaults, lamportSignUserOp, show } from './UserOperation'
import saveCounterfactualOrigin from './saveCounterfactualOrigin'
import saveAccount from './saveAccount'
import getInitCode from './getInitCode'
import ENTRYPOINT from './EntryPoint'
import getNonce from './getNonce'
import submitUserOperationViaBundler from './submitUserOperationViaBundler'
import EntryPointJSON from './contracts/EntryPoint.json'
const program = new Command()


program
    .command('create-account')
    .description('Create a new account')
    .argument('<string>', 'Chain Name')
    .argument('<string>', 'Account Name')
    .action(async (_chainName, _accountName) => {
        const chainName = _chainName.toLowerCase()
        const accountName = _accountName.toLowerCase()

        const blockchain = loadChain(chainName)

        // Create an account (counterfactual only) and report the name, address, chain
        const counterfactual = await generateNewCounterfactual(blockchain, accountName)

        console.table({
            "Account Name": accountName,
            "Counterfactual Address": counterfactual,
            "Chain": blockchain.name,
        })
    })

const getDeposit = async (adrs : address, chainName : string) => {
    const blockchain = loadChain(chainName)
    const provider = loadProviders(blockchain.name)[0]
    const entryPoint = new ethers.Contract(ENTRYPOINT, EntryPointJSON.abi, provider)
    const deposit = await entryPoint.balanceOf(adrs)
    return deposit
}

program
    .command('deposit')
    .description('Deposit funds into the entry point to continute paying the prefund')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'Amount')
    .action(async (_accountName, amount) => {

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
    })

program
    .command('send-eth')
    .description('Send ETH to an account')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'To Address')
    .argument('<string>', 'Amount')
    .action(async (_accountName, toAddress: string, amount) => {
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
            .bind(show)

        await submitUserOperationViaBundler(userOp.unwrap(), account)
        saveAccount(account)
    })

program
    .command('add-keys')
    .description('Add keys to an account')
    .argument('<string>', 'Account Name')
    .action(async (_accountName) => {
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
    })

program
    .command('auto-clean')
    .description('Ensure all pkhs which are marked safe to use are still safe to use. Mark all unsafe pkhs as unsafe (we will save a list of potytentually unsafe pkhs as we go)')
    .argument('<string>', 'Account Name')
    .action(async (_accountName) => {

    })

program.parse(process.argv)