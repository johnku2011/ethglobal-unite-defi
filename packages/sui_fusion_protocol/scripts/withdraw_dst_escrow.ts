import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { ESCROW_FACTORY_ID, getDeveloper, getEnv, PACKAGE_ID } from "./utils";
import { fromBase64, SUI_CLOCK_OBJECT_ID, SUI_TYPE_ARG } from "@mysten/sui/utils";
import { bcs } from "@mysten/sui/bcs";

export type InputParams = {
    escrowFactoryId: string;
    orderHash: Uint8Array<ArrayBufferLike>; // Unique identifier for the order
    secret: Uint8Array<ArrayBufferLike>;
    depositType: string; // Type of token for the deposit
};

function withdrawDstEscrow(params: InputParams) {
    const { escrowFactoryId, depositType, orderHash, secret } = params;
    return (tx: Transaction) => {
        tx.moveCall({
            target: `${PACKAGE_ID}::factory::withdraw_dst`,
            typeArguments: [depositType],
            arguments: [
                tx.object(escrowFactoryId),
                bcs.vector(bcs.U8).serialize(orderHash),
                bcs.vector(bcs.U8).serialize(secret),
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

    const orderHash = fromBase64("hbUKZt5OEqwVkx7hNd9ipToiAijpOAHJfXVp9go1pL8=");
    const secret = fromBase64("u9ct82p46WvF6/n0acAy5ZSre7xZ56y+PDcpWqPQ/VQ=");
    tx.add(
        withdrawDstEscrow({
            escrowFactoryId: ESCROW_FACTORY_ID,
            orderHash,
            secret,
            depositType: SUI_TYPE_ARG, // Assuming SUI_TYPE_ARG is the type of token for the deposit
        }),
    );

    const result = await client.signAndExecuteTransaction({
        signer: developer,
        transaction: tx,
    });

    console.log(result);
}

main().catch(console.error);
