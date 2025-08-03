import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { ESCROW_FACTORY_ID, getDeveloper, getEnv, PACKAGE_ID } from "./utils";
import { fromBase64, SUI_CLOCK_OBJECT_ID, SUI_TYPE_ARG } from "@mysten/sui/utils";
import { bcs } from "@mysten/sui/bcs";

export type InputParams = {
    escrowFactoryId: string;
    orderHash: Uint8Array<ArrayBufferLike>; // Unique identifier for the order
    depositType: string; // Type of token for the deposit
};

function cancelDstEscrow(params: InputParams) {
    const { escrowFactoryId, depositType, orderHash } = params;
    return (tx: Transaction) => {
        tx.moveCall({
            target: `${PACKAGE_ID}::factory::cancel_dst`,
            typeArguments: [depositType],
            arguments: [
                tx.object(escrowFactoryId),
                bcs.vector(bcs.U8).serialize(orderHash),
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
    tx.add(
        cancelDstEscrow({
            escrowFactoryId: ESCROW_FACTORY_ID,
            orderHash,
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
