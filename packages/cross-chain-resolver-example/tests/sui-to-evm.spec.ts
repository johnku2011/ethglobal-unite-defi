import 'dotenv/config'
import {jest} from '@jest/globals'

import {createServer, CreateServerReturnType} from 'prool'
import {anvil} from 'prool/instances'

import Sdk from '@1inch/cross-chain-sdk'

const {Address, Immutables} = Sdk
import {
    computeAddress,
    ContractFactory,
    Interface,
    JsonRpcProvider,
    MaxUint256,
    parseEther,
    parseUnits,
    randomBytes,
    Wallet as SignerWallet
} from 'ethers'
import {uint8ArrayToHex, hexToUint8Array} from '@1inch/byte-utils'
import {SUI_TYPE_ARG} from '@mysten/sui/utils'
import assert from 'node:assert'
import {ChainConfig, config} from './config'
import {Wallet} from './wallet'
import {Resolver} from './resolver'
import {EscrowFactory} from './escrow-factory'
import {createSrcEscrow, withdrawSrcEscrow} from './utils'
import factoryContract from '../dist/contracts/TestEscrowFactory.sol/TestEscrowFactory.json'
import resolverContract from '../dist/contracts/Resolver.sol/Resolver.json'

jest.setTimeout(1000 * 60)

const userPk = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'
const resolverPk = '0x82d7fe275b77971877b5ab0bf8c3e5cca62156025a5d3e67c535f51c99a955fe'

describe('Resolving example', () => {
    const dstChainId = config.chain.destination.chainId

    type Chain = {
        node?: CreateServerReturnType | undefined
        provider: JsonRpcProvider
        escrowFactory: string
        resolver: string
    }

    // let src: Chain
    let dst: Chain

    // let srcChainUser: Wallet
    let dstChainUser: Wallet
    // let srcChainResolver: Wallet
    let dstChainResolver: Wallet

    // let srcFactory: EscrowFactory
    let dstFactory: EscrowFactory
    // let srcResolverContract: Wallet
    // let dstResolverContract: Wallet

    // let resolverInstance: Resolver

    // let srcTimestamp: bigint

    // async function getBalances(
    //     srcToken: string
    //     // dstToken: string
    // ): Promise<{dst: {user: bigint; resolver: bigint}}> {
    //     return {
    //         dst: {
    //             user: await dstChainUser.tokenBalance(srcToken),
    //             resolver: await dstResolverContract.tokenBalance(srcToken)
    //         }
    //         // dst: {
    //         //     user: await dstChainUser.tokenBalance(dstToken),
    //         //     resolver: await dstResolverContract.tokenBalance(dstToken)
    //         // }
    //     }
    // }

    async function increaseTime(t: number): Promise<void> {
        await Promise.all([dst].map((chain) => chain.provider.send('evm_increaseTime', [t])))
    }

    // Utility to get ETH balance of dstChainUser
    async function getEthBalance(address: string, provider: JsonRpcProvider): Promise<bigint> {
        const balance = await provider.getBalance(address)

        return balance
    }

    beforeAll(async () => {
        ;[dst] = await Promise.all([initChain(config.chain.source)])

        // srcChainUser = new Wallet(userPk, src.provider)
        dstChainUser = new Wallet(userPk, dst.provider)
        dstChainResolver = new Wallet(resolverPk, dst.provider)

        // Check ETH balance of dstChainUser
        const ethBalance = await getEthBalance(await dstChainUser.getAddress(), dst.provider)
        console.log(`[${dstChainId}] dstChainUser ETH balance:`, ethBalance.toString())

        // srcFactory = new EscrowFactory(src.provider, src.escrowFactory)
        dstFactory = new EscrowFactory(dst.provider, dst.escrowFactory)
        // get 1000 USDC for user in SRC chain and approve to LOP

        await dstChainUser.topUpFromDonor(
            config.chain.source.tokens.USDC.address,
            config.chain.source.tokens.USDC.donor,
            parseUnits('1000', 6)
        )

        const usdcBalance = await dstChainUser.tokenBalance(config.chain.source.tokens.USDC.address)
        console.log(`[${dstChainId}] dstChainUser USDC balance:`, usdcBalance.toString())

        await dstChainUser.transfer(dst.resolver, parseEther('0.1'))
        await dstChainUser.transfer(await dstChainResolver.getAddress(), parseEther('0.1'))

        // await dstChainResolver.unlimitedApprove(config.chain.source.tokens.USDC.address, dst.escrowFactory)

        await dstChainUser.transferToken(
            config.chain.source.tokens.USDC.address, //token address
            dst.resolver, // resolver contract address
            parseUnits('10', 6)
        )

        // const resolverInstance = new Resolver(
        //     dst.resolver, // srcAddress == dstAddress [Resolver Contract]
        //     dst.resolver
        // )
        const usdcInterface = new Interface(['function approve(address spender, uint256 amount) returns (bool)'])
        const approveCalldata = usdcInterface.encodeFunctionData('approve', [
            dst.escrowFactory, // Approve the factory
            MaxUint256 // Unlimited approval
        ])
        const resolverInterface = new Interface(resolverContract.abi)

        await dstChainResolver.send({
            to: dst.resolver,
            data: resolverInterface.encodeFunctionData('arbitraryCalls', [
                [config.chain.source.tokens.USDC.address], // Target: USDC contract
                [approveCalldata] // Call: approve(factory, MaxUint256)
            ])
        })
    })

    afterAll(async () => {
        // src.provider.destroy()
        dst.provider.destroy()
        await Promise.all([dst.node?.stop()])
    })

    describe('Fill', () => {
        it('should swap Sui SUI -> Ethereum USDC. Single fill only', async () => {
            // Display price info
            const suiPrice = 3n // 1 SUI = 3 USDC
            const suiDeposit = parseUnits('0.01', 9) // 0.1 SUI in base units
            const usdcExpected = (suiDeposit * suiPrice) / 10n ** 6n // Convert to USDC base units
            console.log(`\n--- Swap Rate ---`)
            console.log(`1 SUI = ${suiPrice} USDC`)
            console.log(`Deposit: ${suiDeposit} SUI`)
            console.log(`Expected USDC on EVM: ${usdcExpected} USDC\n`)

            // User creates order
            const secret = uint8ArrayToHex(randomBytes(32)) // note: use crypto secure random number in real world
            const hashLock = Sdk.HashLock.forSingleFill(secret)

            const timeLocks = Sdk.TimeLocks.new({
                srcWithdrawal: 10n,
                srcPublicWithdrawal: 120n,
                srcCancellation: 121n,
                srcPublicCancellation: 122n,
                dstWithdrawal: 10n,
                dstPublicWithdrawal: 100n,
                dstCancellation: 101n
            })
            timeLocks.setDeployedAt(BigInt((await dstChainUser.provider.getBlock('latest'))!.timestamp))

            const orderHash = uint8ArrayToHex(randomBytes(32))
            const resolverContract = new Resolver(dst.resolver, dst.resolver)

            console.log(`\n=== [${dstChainId}] Start Swap SUI -> USDC ===`)
            console.log(`Order Hash: ${orderHash}`)
            console.log(`Secret: ${secret}`)
            console.log(`HashLock: ${hashLock.toString()}`)
            console.log(`Maker: ${await dstChainUser.getAddress()}`)
            console.log(`Taker (Resolver): ${dst.resolver}`)
            console.log(`Asset: USDC (${config.chain.destination.tokens.USDC.address})`)
            // Format USDC amount to 6 decimals max for parseUnits

            console.log(`Amount: ${usdcExpected}`)
            console.log(`Deposit Asset: SUI`)
            console.log(`Deposit Amount: ${suiDeposit}`)
            console.log(`Safety Deposit: ${parseEther('0.01').toString()}`)

            const dstImmutables = Immutables.new({
                orderHash: orderHash,
                hashLock: hashLock,
                maker: new Address(await dstChainUser.getAddress()),
                taker: new Address(dst.resolver),
                token: new Address(config.chain.destination.tokens.USDC.address),
                amount: usdcExpected, // 0.35 USDC
                safetyDeposit: parseEther('0.01'),
                timeLocks: timeLocks
            })

            const {txHash: orderFillHash, blockTimestamp: dstDeployedAt} = await dstChainResolver.send(
                resolverContract.deployDst(dstImmutables)
            )

            console.log(`[${dstChainId}] Order filled on chain`)
            console.log(`TxHash: ${orderFillHash}`)
            console.log(`BlockTimestamp: ${dstDeployedAt}`)

            await createSrcEscrow({
                orderHash: hexToUint8Array(orderHash),
                hashlock: hexToUint8Array(hashLock.toString()),
                maker: new Address(await dstChainUser.getAddress()).toString(),
                depositAmount: Number(suiDeposit),
                depositTokenType: SUI_TYPE_ARG,
                timelocks: {
                    srcWithdrawal: 1n,
                    srcPublicWithdrawal: 120n,
                    srcCancellation: 300n * 1000n,
                    srcPublicCancellation: 122n,
                    dstWithdrawal: 1n,
                    dstPublicWithdrawal: 100n,
                    dstCancellation: 201n * 1000n
                }
            })
            console.log(`[SUI] Created src escrow for order`)
            console.log(`OrderHash: ${orderHash}`)
            console.log(`Deposit Asset: SUI`)
            console.log(`Deposit Amount: ${suiDeposit.toString()}`)

            const ESCROW_DST_IMPLEMENTATION = await dstFactory.getDestinationImpl()
            const escrowFactory = new Sdk.EscrowFactory(new Address(dst.escrowFactory))
            const dstEscrowAddress = escrowFactory.getEscrowAddress(
                dstImmutables.withDeployedAt(dstDeployedAt).hash(),
                ESCROW_DST_IMPLEMENTATION
            )

            await increaseTime(10)
            await setTimeout(() => {}, 1000)
            console.log(`Simulating src escrow withdrawal`)

            const withdrawSrcEscrowReceipt = await withdrawSrcEscrow({
                orderHash: hexToUint8Array(orderHash),
                secret: hexToUint8Array(secret),
                depositType: SUI_TYPE_ARG
            })

            console.log(`[SUI] Withdrawn src escrow for order, hash:`, withdrawSrcEscrowReceipt.digest)
            console.log(`OrderHash: ${orderHash}`)
            console.log(`Secret Used: ${secret}`)

            console.log(`[${dstChainId}] Withdrawing funds for user from dst escrow`)
            console.log(`DstEscrowAddress: ${dstEscrowAddress}`)
            const {txHash: withdrawTxHash} = await dstChainResolver.send(
                resolverContract.withdraw('dst', dstEscrowAddress, secret, dstImmutables.withDeployedAt(dstDeployedAt))
            )
            console.log(`[${dstChainId}] Withdrawn funds from dst escrow`)
            console.log(`TxHash: ${withdrawTxHash}`)
            console.log(`Asset: USDC (${config.chain.destination.tokens.USDC.address})`)
            console.log(`Amount: ${parseUnits(usdcExpected.toString(), 6).toString()}`)
            console.log(`=== [${dstChainId}] End Swap SUI -> USDC ===\n`)
        })
    })
})

async function initChain(
    cnf: ChainConfig
): Promise<{node?: CreateServerReturnType; provider: JsonRpcProvider; escrowFactory: string; resolver: string}> {
    const {node, provider} = await getProvider(cnf)
    const deployer = new SignerWallet(cnf.ownerPrivateKey, provider)

    // deploy EscrowFactory
    const escrowFactory = await deploy(
        factoryContract,
        [
            cnf.limitOrderProtocol,
            cnf.wrappedNative, // feeToken,
            Address.fromBigInt(0n).toString(), // accessToken,
            deployer.address, // owner
            60 * 30, // src rescue delay
            60 * 30 // dst rescue delay
        ],
        provider,
        deployer
    )
    console.log(`[${cnf.chainId}]`, `Escrow factory contract deployed to`, escrowFactory)

    // deploy Resolver contract
    const resolver = await deploy(
        resolverContract,
        [
            escrowFactory,
            cnf.limitOrderProtocol,
            computeAddress(resolverPk) // resolver as owner of contract
        ],
        provider,
        deployer
    )
    console.log(`[${cnf.chainId}]`, `Resolver contract deployed to`, resolver)

    return {node: node, provider, resolver, escrowFactory}
}

async function getProvider(cnf: ChainConfig): Promise<{node?: CreateServerReturnType; provider: JsonRpcProvider}> {
    if (!cnf.createFork) {
        return {
            provider: new JsonRpcProvider(cnf.url, cnf.chainId, {
                cacheTimeout: -1,
                staticNetwork: true
            })
        }
    }

    const node = createServer({
        instance: anvil({forkUrl: cnf.url, chainId: cnf.chainId}),
        limit: 1
    })
    await node.start()

    const address = node.address()
    assert(address)

    const provider = new JsonRpcProvider(`http://[${address.address}]:${address.port}/1`, cnf.chainId, {
        cacheTimeout: -1,
        staticNetwork: true
    })

    return {
        provider,
        node
    }
}

/**
 * Deploy contract and return its address
 */
async function deploy(
    json: {abi: any; bytecode: any},
    params: unknown[],
    provider: JsonRpcProvider,
    deployer: SignerWallet
): Promise<string> {
    const deployed = await new ContractFactory(json.abi, json.bytecode, deployer).deploy(...params)
    await deployed.waitForDeployment()

    return await deployed.getAddress()
}
