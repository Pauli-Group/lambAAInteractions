import { Command } from 'commander'
import "dotenv/config"
import { BytesLike, ethers } from 'ethers'
import { type Blockchain } from './Blockchain'
import { loadAccount, loadChain, loadProviders } from './loaders'
import { promises as fs } from 'fs';
import path from 'path';
import LamportAccountFactoryJSON from './contracts/LamportAccountFactory.json'
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

const program = new Command()

const ENTRYPOINT = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'

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


async function getInitCode(account: Account): Promise<BytesLike> {
    const [normalProvider, bundlerProvider] = loadProviders(account.chainName)
    const code = await normalProvider.getCode(account.counterfactual)
    if (code !== '0x')
        return '0x'

    const factoryInterface = new ethers.utils.Interface(LamportAccountFactoryJSON.abi)

    return ethers.utils.hexConcat([
        account.factory,
        factoryInterface.encodeFunctionData('createAccount', [account.signerAddress, account.salt, account.initialKeyHashes])
    ])
}

const submitUserOperationViaBundler = async (userOp: UserOperation) => {
    // May need to better fund relayer before this will work
    // const bundlerRpc = `http://0.0.0.0:14337/80001/`
    const bundlerRpc = `http://0.0.0.0:14337/11155111/`
    // const bundlerRpc = `https://api.stackup.sh/v1/node/e9b394ee43e6df1fb608d6f321a726ddcf46096145ad4afabc5c8716dba9bea0`
    const bundlerProvider = new ethers.providers.JsonRpcProvider(bundlerRpc)

    const entryPoints = await bundlerProvider.send("eth_supportedEntryPoints", [])
    console.log(`entryPoints: `, entryPoints)

    // send the userOp to the bundler
    const response = await bundlerProvider.send("eth_sendUserOperation", [
        userOp,
        ENTRYPOINT
    ])

    console.log(`response: `, response)
}

async function getNonce(account: Account): Promise<uint256> {
    const [normalProvider, bundlerProvider] = loadProviders(account.chainName)
    const code = await normalProvider.getCode(account.counterfactual)
    if (code === '0x')
        return 0

    const entrypoint = new ethers.Contract(ENTRYPOINT, [
        'function getNonce(address, uint192) view returns (uint256)'
    ], normalProvider)
    const nonce = await entrypoint.getNonce(account.counterfactual, 0)
    return nonce.toNumber()
}

const saveAccount = async (account: Account) => saveCounterfactualOrigin(
    account.counterfactual,
    account.factory,
    account.keys,
    account.initialKeyHashes,
    ethers.Wallet.fromMnemonic(account.ecdsaSecret, account.ecdsaPath),
    account.network,
    account.chainName,
    account.accountName
)


program
    .command('send-eth')
    .description('Send ETH to an account')
    .argument('<string>', 'Account Name')
    .argument('<string>', 'To Address')
    .argument('<string>', 'Amount')
    .action(async (_accountName, toAddress: string, amount) => {
        const account = await loadAccount(_accountName)
        console.log(account)

        const callData = accountInterface.encodeFunctionData('execute', [
            toAddress,
            amount,
            '0x'
        ])

        const initCode = await getInitCode(account);

        if ((initCode !== '0x') && (toAddress !== ENTRYPOINT)) {
            console.error(`First Transaction must pay prefund by sending eth to ${ENTRYPOINT}`)
            process.exit(1)
        }

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

        await submitUserOperationViaBundler(userOp.unwrap())

        const [normalProvider, bundlerProvider] = loadProviders(account.chainName)

        saveAccount(account)
    })

program
    .command('add-keys')
    .description('Add keys to an account')
    .argument('<string>', 'Account Name')
    .action(async (accountName) => {

    })

program.parse(process.argv)