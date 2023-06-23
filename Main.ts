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
import getDeposit from './getDeposit'
import createAccount from './createAccount'
import sendEth from './sendEth'
import deposit from './deposit'
import addKeys from './addKeys'

const program = new Command()

program
    .command('create-account')
    .description('Create a new account')
    .argument('<string>', 'Chain Name')
    .argument('<string>', 'Account Name')
    .action(createAccount)

program
    .command('deposit')
    .description('Deposit funds into the entry point to continute paying the prefund')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'Amount')
    .action(deposit)

program
    .command('send-eth')
    .description('Send ETH to an account')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'To Address')
    .argument('<string>', 'Amount')
    .action(sendEth)

program
    .command('add-keys')
    .description('Add keys to an account')
    .argument('<string>', 'Account Name')
    .action(addKeys)

program
    .command('show')
    .description('Show an account')
    .argument('<string>', 'Account Name')
    .action(async (_accountName) => {
        const account = await loadAccount(_accountName.toLowerCase())
        const [normalProvider, bundlerProvider] = loadProviders(account.chainName)
        const accountContract = new ethers.Contract(account.counterfactual, accountInterface, normalProvider)

        const balance = await normalProvider.getBalance(account.counterfactual)
        const deposit = await getDeposit(account.counterfactual, account.chainName)

        const entryPointAddress = await accountContract.entryPoint().catch(() => 'Not Deployed')

        const code = await normalProvider.getCode(account.counterfactual)
        const liveKeyCount = await accountContract.liveKeyCount().catch(() => 'Not Deployed')

        const nonce = await getNonce(account)

        const data = {
            counterfactual: account.counterfactual,
            balance: ethers.utils.formatEther(balance),
            deposit: ethers.utils.formatEther(deposit),
            'entry point': entryPointAddress,
            deployed: code === '0x' ? 'No' : 'Yes',
            'live key count': liveKeyCount === 'Not Deployed' ? liveKeyCount : liveKeyCount.toNumber(),
            nonce: nonce

        }

        console.table(data)

    })

program
    .command('auto-clean')
    .description('Ensure all pkhs which are marked safe to use are still safe to use. Mark all unsafe pkhs as unsafe (we will save a list of potytentually unsafe pkhs as we go)')
    .argument('<string>', 'Account Name')
    .action(async (_accountName) => {

    })

program.parse(process.argv)