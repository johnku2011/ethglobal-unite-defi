module sui_fusion_protocol::factory;

use std::{type_name::{Self, TypeName}, vector};
use sui::{
    clock::{Self, Clock},
    coin::{Self, Coin},
    object_table::{Self, ObjectTable},
    sui::SUI,
    transfer::{Self, transfer}
};
use sui_fusion_protocol::{escrow, timelock};

// === Structs ===

public struct EscrowFactory has key, store {
    id: UID,
    escrow_dsts: ObjectTable<vector<u8>, escrow::Escrow>,
    escrow_srcs: ObjectTable<vector<u8>, escrow::Escrow>,
}

// === Errors ===
const EInvalidCreationTime: u64 = 1;
const EInvalidOrderHash: u64 = 2;
const EInvalidHashlock: u64 = 3;

// === Events ===

public struct EscrowCreated has drop {
    maker: address,
    receiver: address,
    source_token: TypeName,
    target_token: TypeName,
    source_amount: u256,
    target_amount: u256,
}

fun init(ctx: &mut TxContext) {
    let factory = EscrowFactory {
        id: object::new(ctx),
        escrow_dsts: object_table::new(ctx),
        escrow_srcs: object_table::new(ctx),
    };

    transfer::share_object(factory);
}

public fun create_dst_escrow<Token>(
    factory: &mut EscrowFactory,
    order_hash: vector<u8>,
    hashlock: vector<u8>,
    maker: address,
    deposit: Coin<Token>,
    safety_deposit: Coin<SUI>,
    // Timelock parameters
    src_withdrawal: u64,
    src_public_withdrawal: u64,
    src_cancellation: u64,
    src_public_cancellation: u64,
    dst_withdrawal: u64,
    dst_public_withdrawal: u64,
    dst_cancellation: u64,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    assert!(vector::length(&order_hash) == 32, EInvalidOrderHash);
    assert!(vector::length(&hashlock) == 32, EInvalidHashlock);

    let taker = ctx.sender();

    let token_name = type_name::get<Token>();

    let timelocks = timelock::create(
        clock::timestamp_ms(clock),
        src_withdrawal,
        src_public_withdrawal,
        src_cancellation,
        src_public_cancellation,
        dst_withdrawal,
        dst_public_withdrawal,
        dst_cancellation,
    );

    let escros = escrow::create<Token>(
        order_hash,
        hashlock,
        maker,
        taker,
        deposit,
        safety_deposit,
        ctx.sender(), // resolver is the sender in this case
        timelocks,
        ctx,
    );

    factory
        .escrow_dsts
        .add(
            order_hash,
            escros,
        );

    // let dst_cancellation_timestamp = get from timelocks
    // assert!(dst_cancellation_timestamp > src_cancellation_timestamp, 0x1, EInvalidCreationTime);
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
