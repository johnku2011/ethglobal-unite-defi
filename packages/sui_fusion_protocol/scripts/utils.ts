import "dotenv/config";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { SuiClient, SuiObjectResponse } from "@mysten/sui/client";
import { UINT_40_MAX } from "@1inch/byte-utils";
import Sdk, { Address, HashLock, SupportedChain } from "@1inch/cross-chain-sdk";
import { JsonRpcProvider, randomBytes } from "ethers";

export const DEVELOPER_PRIVATE_KEY = process.env.DEVELOPER_PRIVATE_KEY || "";
export const ENV = process.env.ENV || "testnet";
export const PACKAGE_ID =
    process.env.PACKAGE_ID || "0x9db1e86f54bea50c6b0aac44cfd469e0a797b694462cff367ce41beb40decd8d";
export const ESCROW_FACTORY_ID =
    process.env.ESCROW_FACTORY_ID ||
    "0xf7c2c0a019eaad5fa3d4bab8d055062a1d4cdd62beea64938a132a6e4245b509";

export const getDeveloper = () => {
    return Ed25519Keypair.fromSecretKey(DEVELOPER_PRIVATE_KEY);
    // return Ed25519Keypair.deriveKeypair(DEVELOPER_PRIVATE_KEY, `m/44'/784'/0'/0'/0'`);
};

export const getEnv = () => {
    if (ENV !== "mainnet" && ENV !== "testnet") {
        throw new Error("Invalid environment. Use 'mainnet' or 'testnet'.");
    }
    return ENV;
};

export const getResolverOwnerCaps = async (client: SuiClient, ownerId: string) => {
    const allOwnedObjects: SuiObjectResponse[] = [];
    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
        const ownedObjects = await client.getOwnedObjects({
            owner: ownerId,
            cursor,
            filter: {
                StructType: `${PACKAGE_ID}::factory::ResolverOwnerCap`,
            },
        });

        allOwnedObjects.push(...ownedObjects.data);
        cursor = ownedObjects.nextCursor ?? null;
        hasNextPage = ownedObjects.hasNextPage;
    }

    return allOwnedObjects;
};

export function generateRandomBytesNode(length: number) {
    return randomBytes(length);
}

export const createOrder = async (hashLock: string) => {
    const defaultSrcEscrowFactory =
        "0x9db1e86f54bea50c6b0aac44cfd469e0a797b694462cff367ce41beb40decd8d";
    const makerAddress = "0xD476C7CD69a988754785C0dD78e024Ad577bE855"; // Example maker address

    const provider = new JsonRpcProvider("https://eth.api.onfinality.io/public");
    const evmBlock = await provider.getBlock("latest");
    const evmNow = BigInt(evmBlock!.timestamp);

    const order = Sdk.CrossChainOrder.new(
        new Address(defaultSrcEscrowFactory),
        {
            salt: Sdk.randBigInt(1000n),
            maker: new Address(makerAddress),
            makingAmount: 100_000n, // 100 USDC in smallest unit
            takingAmount: 100_000n,
            makerAsset: new Address("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"), // WETH
            takerAsset: new Address("0x2::sui::SUI"), // SUI
        },
        {
            hashLock: HashLock.fromString(hashLock),
            timeLocks: Sdk.TimeLocks.new({
                srcWithdrawal: 10n, // 10sec finality lock for test
                srcPublicWithdrawal: 120n, // 2m for private withdrawal
                srcCancellation: 121n, // 1sec public withdrawal
                srcPublicCancellation: 122n, // 1sec private cancellation
                dstWithdrawal: 10n, // 10sec finality lock for test
                dstPublicWithdrawal: 100n, // 100sec private withdrawal
                dstCancellation: 101n, // 1sec public withdrawal
            }),
            srcChainId: 1,
            dstChainId: 10000000 as SupportedChain,
            srcSafetyDeposit: 100n,
            dstSafetyDeposit: 10_000_000n,
        },
        {
            auction: new Sdk.AuctionDetails({
                initialRateBump: 0,
                points: [],
                duration: 120n,
                startTime: evmNow,
            }),
            whitelist: [
                // {
                //     address: new Address(src.resolver),
                //     allowFrom: 0n,
                // },
            ],
            resolvingStartTime: 0n,
        },
        {
            nonce: Sdk.randBigInt(UINT_40_MAX),
            allowPartialFills: false,
            allowMultipleFills: false,
        },
    );
    return order;
};


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