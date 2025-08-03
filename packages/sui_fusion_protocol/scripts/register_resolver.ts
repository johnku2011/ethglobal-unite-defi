import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { ESCROW_FACTORY_ID, getDeveloper, getEnv, PACKAGE_ID } from "./utils";

export type InputParams = {
    escrowFactoryId: string;
    owner: string;
};

function registerResolver(params: InputParams) {
    const { escrowFactoryId, owner } = params;
    return (tx: Transaction) => {
        const [cap] = tx.moveCall({
            target: `${PACKAGE_ID}::factory::regsiter_resolver`,
            typeArguments: [],
            arguments: [tx.object(escrowFactoryId)],
        });

        tx.transferObjects([cap], owner);
    };
}

async function main() {
    const developer = getDeveloper();
    const client = new SuiClient({
        url: getFullnodeUrl(getEnv()),
    });

    const sender = developer.getPublicKey().toSuiAddress();
    console.log(`Sender: ${sender}`);
    const tx = new Transaction();

    tx.setSender(sender);

    tx.add(
        registerResolver({
            escrowFactoryId: ESCROW_FACTORY_ID,
            owner: sender,
        }),
    );

    const result = await client.signAndExecuteTransaction({
        signer: developer,
        transaction: tx,
    });

    console.log(result);
}

main().catch(console.error);
