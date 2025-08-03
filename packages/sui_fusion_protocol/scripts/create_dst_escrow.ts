import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { coinWithBalance, Transaction } from "@mysten/sui/transactions";
import {
    ESCROW_FACTORY_ID,
    generateRandomBytesNode,
    getDeveloper,
    getEnv,
    getResolverOwnerCaps,
    PACKAGE_ID,
} from "./utils";
import { SUI_CLOCK_OBJECT_ID, SUI_TYPE_ARG, toBase64 } from "@mysten/sui/utils";
import { bcs } from "@mysten/sui/bcs";
import { keccak_256 } from "@noble/hashes/sha3";

export type InputParams = {
    escrowFactoryId: string;
    resolverOwnerCapId: string;
    orderHash: Uint8Array<ArrayBufferLike>; // Unique identifier for the order
    hashlock: Uint8Array<ArrayBufferLike>; // Hashlock for the escrow
    maker: string; // Address of the order maker
    depositAmount: number; // Amount to be deposited in the escrow
    depositTokenType: string; // Type of token for the deposit
    safetyDepositAmount: number;
    srcWithdrawlTimelock: number; // Timelock for the withdrawal from the source escrow
    srcPublicWithdrawlTimelock: number; // Public timelock for the withdrawal from the source escrow
    srcCancellationTimelock: number; // Timelock for the cancellation of the source escrow
    srcPublicCancellationTimelock: number; // Public timelock for the cancellation of the source escrow
    dstWithdrawlTimelock: number; // Timelock for the withdrawal from the destination escrow
    dstPublicWithdrawlTimelock: number; // Public timelock for the withdrawal
    dstCancellationTimelock: number; // Timelock for the cancellation of the destination escrow
};

function createDstEscrow(params: InputParams) {
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
        dstCancellationTimelock,
    } = params;
    return (tx: Transaction) => {
        const deposit = coinWithBalance({
            type: depositTokenType,
            balance: depositAmount,
        });
        const safetyDeposit = coinWithBalance({
            type: SUI_TYPE_ARG,
            balance: safetyDepositAmount,
        });
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
                tx.object(SUI_CLOCK_OBJECT_ID),
            ],
        });
    };
}

async function main() {
    const developer = getDeveloper();
    const client = new SuiClient({
        url: getFullnodeUrl(getEnv()),
    });

    const sender = developer.getPublicKey().toSuiAddress();
    const tx = new Transaction();

    tx.setSender(sender);

    const secret = generateRandomBytesNode(32);
    const hashlock = keccak_256(secret);
    const orderHash = generateRandomBytesNode(32); // Generate a random order hash
    const maker = "0xa1574d9f6f883b386a31a50ab27a41f10ba0d28f12f492e0613cdaf143fb4eae"; // Assuming the maker is the sender for this example
    const depositAmount = 1_000; // Replace with actual deposit amount
    const depositTokenType = SUI_TYPE_ARG;
    const safetyDepositAmount = 1_000_000; // Replace with actual safety deposit amount
    const srcWithdrawlTimelock = 300;
    const srcPublicWithdrawlTimelock = 600;
    const srcCancellationTimelock = 901;
    const srcPublicCancellationTimelock = 1200;
    const dstWithdrawlTimelock = 301;
    const dstPublicWithdrawlTimelock = 601;
    const dstCancellationTimelock = 900;

    console.log("Secret: ", secret, toBase64(secret));
    console.log("HashLock: ", hashlock, toBase64(hashlock));
    console.log("Order Hash: ", toBase64(orderHash));

    const resolverOwnerCaps = await getResolverOwnerCaps(client, sender);
    if (resolverOwnerCaps.length === 0) {
        console.error("No resolver owner caps found for the sender.");
        return;
    }

    const resolverOwnerCapId = resolverOwnerCaps[0].data?.objectId;

    if (!resolverOwnerCapId) {
        console.error("No resolver owner cap ID found.");
        return;
    }

    console.log(`Resolver Owner Cap ID: ${resolverOwnerCapId}`);

    tx.add(
        createDstEscrow({
            escrowFactoryId: ESCROW_FACTORY_ID,
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
            dstCancellationTimelock,
        }),
    );

    const result = await client.signAndExecuteTransaction({
        signer: developer,
        transaction: tx,
    });

    console.log(result);
}

main().catch(console.error);
