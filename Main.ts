import { Command } from 'commander'
import "dotenv/config"
import deposit from './deposit'
import addKeys from './addKeys'
import showAccount from './showAccount'
import sendEthAsync from './sendEthAsync'
import createAccount from './createAccount'
import sendEth from './sendEth'

import { promises as fs } from 'fs';
import path from 'path';
import submitCalldata from './submitCalldata'
import finishInit from './finishInit'

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
    .action(showAccount)

program
    .command('send-eth-async')
    .description('Send ETH to an account using pull payments')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'To Address')
    .argument('<string>', 'Amount')
    .action(sendEthAsync)

program
    .command('execute') // consider renaming to 'run' to avoid confusion with 'execute' in the contract
    .description('Execute a transaction on an account. The transaction is specified as a file')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'Calldata File')
    .action(async (_accountName, _calldataFile) => {
        const calldata = await fs.readFile(path.resolve(_calldataFile), 'utf8')
        await submitCalldata(_accountName, calldata)
    })

program
    .command('finish-init')
    .description('Finish the initialization of an account (adds support for ERC777 tokens and Eth Pull Payments)')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'Deposit Amount')
    .action((accountName, depositAmount) => finishInit(accountName, depositAmount, null))

program
    .command('auto-clean')
    .description('Ensure all pkhs which are marked safe to use are still safe to use. Mark all unsafe pkhs as unsafe (we will save a list of potytentually unsafe pkhs as we go)')
    .argument('<string>', 'Account Name')
    .action(async (_accountName) => {

        // STEP 1: Get all currently available PKHs and check they are still redeemable on the contract

        // STEP 2: Get all PKHs we consider "unsafe" and mark them as redeemed if not already

    })

program.parse(process.argv)