/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {Ed25519Keypair} from '@mysten/sui/keypairs/ed25519'
import {SuiClient, getFullnodeUrl} from '@mysten/sui/client'
import {Transaction, coinWithBalance} from '@mysten/sui/transactions'
import {bcs} from '@mysten/sui/bcs'
import {SUI_TYPE_ARG, SUI_CLOCK_OBJECT_ID} from '@mysten/sui/utils'

export const DEVELOPER_PRIVATE_KEY = process.env.DEVELOPER_PRIVATE_KEY || ''
export const ENV = 'testnet'
export const PACKAGE_ID = process.env.PACKAGE_ID || '0x9db1e86f54bea50c6b0aac44cfd469e0a797b694462cff367ce41beb40decd8d'
export const ESCROW_FACTORY_ID =
    process.env.ESCROW_FACTORY_ID || '0xf7c2c0a019eaad5fa3d4bab8d055062a1d4cdd62beea64938a132a6e4245b509'

const client = new SuiClient({
    url: getFullnodeUrl('testnet')
})

export const getDeveloper = () => {
    return Ed25519Keypair.fromSecretKey(DEVELOPER_PRIVATE_KEY)
}

/**
 * Converts a hex string to an array of uint256 (BigInt).
 * Each uint256 is 32 bytes (64 hex chars).
 */
export function hexToUint8Array(hexString: string): Uint8Array {
    if (hexString.length % 2 !== 0) {
        throw new Error('Hex string must have an even number of characters.')
    }

    const bytes = new Uint8Array(hexString.length / 2)

    for (let i = 0; i < hexString.length; i += 2) {
        const byteString = hexString.substring(i, i + 2)
        bytes[i / 2] = parseInt(byteString, 16)
    }

    return bytes
}

export type CreateSrcExcrowInputParams = {
    escrowFactoryId: string
    resolverOwnerCapId: string
    orderHash: Uint8Array<ArrayBufferLike> // Unique identifier for the order
    hashlock: Uint8Array<ArrayBufferLike> // Hashlock for the escrow
    maker: string // Address of the order maker
    depositAmount: number // Amount to be deposited in the escrow
    depositTokenType: string // Type of token for the deposit
    safetyDepositAmount: number
    srcWithdrawlTimelock: number // Timelock for the withdrawal from the source escrow
    srcPublicWithdrawlTimelock: number // Public timelock for the withdrawal from the source escrow
    srcCancellationTimelock: number // Timelock for the cancellation of the source escrow
    srcPublicCancellationTimelock: number // Public timelock for the cancellation of the source escrow
    dstWithdrawlTimelock: number // Timelock for the withdrawal from the destination escrow
    dstPublicWithdrawlTimelock: number // Public timelock for the withdrawal
    dstCancellationTimelock: number // Timelock for the cancellation of the destination escrow
}

export function createSrcEscrowTx(params: CreateSrcExcrowInputParams) {
    const {
        escrowFactoryId,
        resolverOwnerCapId,
        orderHash,
        hashlock,
        maker,
        depositAmount,
        depositTokenType,
        safetyDepositAmount,
        srcWithdrawlTimelock,
        srcPublicWithdrawlTimelock,
        srcCancellationTimelock,
        srcPublicCancellationTimelock,
        dstWithdrawlTimelock,
        dstPublicWithdrawlTimelock,
        dstCancellationTimelock
    } = params

    return (tx: Transaction) => {
        const deposit = coinWithBalance({
            type: depositTokenType,
            balance: depositAmount
        })
        const safetyDeposit = coinWithBalance({
            type: SUI_TYPE_ARG,
            balance: safetyDepositAmount
        })
        tx.moveCall({
            target: `${PACKAGE_ID}::factory::create_src_escrow`,
            typeArguments: [depositTokenType],
            arguments: [
                tx.object(escrowFactoryId),
                tx.object(resolverOwnerCapId),
                bcs.vector(bcs.U8).serialize(orderHash),
                bcs.vector(bcs.U8).serialize(hashlock),
                tx.pure.address(maker),
                deposit,
                safetyDeposit,
                tx.pure.u64(srcWithdrawlTimelock),
                tx.pure.u64(srcPublicWithdrawlTimelock),
                tx.pure.u64(srcCancellationTimelock),
                tx.pure.u64(srcPublicCancellationTimelock),
                tx.pure.u64(dstWithdrawlTimelock),
                tx.pure.u64(dstPublicWithdrawlTimelock),
                tx.pure.u64(dstCancellationTimelock),
                tx.object(SUI_CLOCK_OBJECT_ID)
            ]
        })
    }
}

export function createDstEscrowTx(params: CreateSrcExcrowInputParams) {
    const {
        escrowFactoryId,
        resolverOwnerCapId,
        orderHash,
        hashlock,
        maker,
        depositAmount,
        depositTokenType,
        safetyDepositAmount,
        srcWithdrawlTimelock,
        srcPublicWithdrawlTimelock,
        srcCancellationTimelock,
        srcPublicCancellationTimelock,
        dstWithdrawlTimelock,
        dstPublicWithdrawlTimelock,
        dstCancellationTimelock
    } = params

    return (tx: Transaction) => {
        const deposit = coinWithBalance({
            type: depositTokenType,
            balance: depositAmount
        })
        const safetyDeposit = coinWithBalance({
            type: SUI_TYPE_ARG,
            balance: safetyDepositAmount
        })
        tx.moveCall({
            target: `${PACKAGE_ID}::factory::create_dst_escrow`,
            typeArguments: [depositTokenType],
            arguments: [
                tx.object(escrowFactoryId),
                tx.object(resolverOwnerCapId),
                bcs.vector(bcs.U8).serialize(orderHash),
                bcs.vector(bcs.U8).serialize(hashlock),
                tx.pure.address(maker),
                deposit,
                safetyDeposit,
                tx.pure.u64(srcWithdrawlTimelock),
                tx.pure.u64(srcPublicWithdrawlTimelock),
                tx.pure.u64(srcCancellationTimelock),
                tx.pure.u64(srcPublicCancellationTimelock),
                tx.pure.u64(dstWithdrawlTimelock),
                tx.pure.u64(dstPublicWithdrawlTimelock),
                tx.pure.u64(dstCancellationTimelock),
                tx.object(SUI_CLOCK_OBJECT_ID)
            ]
        })
    }
}

export async function createSrcEscrow({
    orderHash,
    hashlock,
    maker,
    depositAmount,
    depositTokenType,
    timelocks
}: {
    orderHash: Uint8Array<ArrayBufferLike>
    hashlock: Uint8Array<ArrayBufferLike>
    maker: string
    depositAmount: number
    depositTokenType: string
    timelocks: {
        srcWithdrawal: bigint
        srcPublicWithdrawal: bigint
        srcCancellation: bigint
        srcPublicCancellation: bigint
        dstWithdrawal: bigint
        dstPublicWithdrawal: bigint
        dstCancellation: bigint
    }
}): Promise<string | undefined> {
    const tx = new Transaction()

    const resolverOwnerCapId = '0xae44cf5ff1f4e063f1113eda02a2f4439115dc66c62bbce2bc692ccae974f37a'

    tx.add(
        createSrcEscrowTx({
            escrowFactoryId: ESCROW_FACTORY_ID,
            resolverOwnerCapId,
            orderHash,
            hashlock,
            maker,
            depositAmount,
            depositTokenType,
            safetyDepositAmount: 1_000_000, // Replace with actual safety deposit amount
            srcWithdrawlTimelock: Number(timelocks.srcWithdrawal),
            srcPublicWithdrawlTimelock: Number(timelocks.srcPublicWithdrawal),
            srcCancellationTimelock: Number(timelocks.srcCancellation),
            srcPublicCancellationTimelock: Number(timelocks.srcPublicCancellation),
            dstWithdrawlTimelock: Number(timelocks.dstWithdrawal),
            dstPublicWithdrawlTimelock: Number(timelocks.dstPublicWithdrawal),
            dstCancellationTimelock: Number(timelocks.dstCancellation)
        })
    )

    const res = await client.signAndExecuteTransaction({
        signer: getDeveloper(),
        transaction: tx,
        options: {showEffects: true, showObjectChanges: true}
    })

    return res.objectChanges?.find((change) => change.type === 'created')?.objectId
}

export async function createDstEscrow({
    orderHash,
    hashlock,
    maker,
    depositAmount,
    depositTokenType,
    timelocks
}: {
    orderHash: Uint8Array<ArrayBufferLike>
    hashlock: Uint8Array<ArrayBufferLike>
    maker: string
    depositAmount: number
    depositTokenType: string
    timelocks: {
        srcWithdrawal: bigint
        srcPublicWithdrawal: bigint
        srcCancellation: bigint
        srcPublicCancellation: bigint
        dstWithdrawal: bigint
        dstPublicWithdrawal: bigint
        dstCancellation: bigint
    }
}): Promise<string | undefined> {
    const tx = new Transaction()

    const resolverOwnerCapId = '0xae44cf5ff1f4e063f1113eda02a2f4439115dc66c62bbce2bc692ccae974f37a'

    tx.add(
        createDstEscrowTx({
            escrowFactoryId: ESCROW_FACTORY_ID,
            resolverOwnerCapId,
            orderHash,
            hashlock,
            maker,
            depositAmount,
            depositTokenType,
            safetyDepositAmount: 1_000_000, // Replace with actual safety deposit amount
            srcWithdrawlTimelock: Number(timelocks.srcWithdrawal),
            srcPublicWithdrawlTimelock: Number(timelocks.srcPublicWithdrawal),
            srcCancellationTimelock: Number(timelocks.srcCancellation),
            srcPublicCancellationTimelock: Number(timelocks.srcPublicCancellation),
            dstWithdrawlTimelock: Number(timelocks.dstWithdrawal),
            dstPublicWithdrawlTimelock: Number(timelocks.dstPublicWithdrawal),
            dstCancellationTimelock: Number(timelocks.dstCancellation)
        })
    )

    const res = await client.signAndExecuteTransaction({
        signer: getDeveloper(),
        transaction: tx,
        options: {showEffects: true, showObjectChanges: true}
    })

    return res.objectChanges?.find((change) => change.type === 'created')?.objectId
}
