import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { ESCROW_FACTORY_ID, getDeveloper, getEnv, hexToUint8Array, PACKAGE_ID } from "./utils";
import { fromBase58, fromBase64, SUI_CLOCK_OBJECT_ID, SUI_TYPE_ARG } from "@mysten/sui/utils";
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

    const orderHash = hexToUint8Array(
        "18849117470fd765949f46f1dfbe5cdbc25d889ef4c3731fbcf8819c5e4e47d8",
    );
    const secret = Uint8Array.from([
        181, 130, 141, 112, 234, 114, 200, 55, 95, 110, 206, 190, 224, 213, 140, 101, 148, 206, 198,
        132, 33, 234, 37, 63, 232, 75, 217, 111, 149, 112, 187, 31,
    ]);
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
