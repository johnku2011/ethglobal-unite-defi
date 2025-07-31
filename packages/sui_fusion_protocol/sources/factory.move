module sui_fusion_protocol::factory;

use std::{type_name::{Self, TypeName}, vector};
use sui::{
    clock::{Self, Clock},
    coin::{Self, Coin},
    event,
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
const EDstEscrowExists: u64 = 4;
// === Events ===

public struct EscrowCreated has copy, drop {
    escrow_id: ID,
    order_hash: vector<u8>,
    hashlock: vector<u8>,
    maker: address,
    taker: address,
    amount: u64,
    safety_deposit: u64,
    resolver: address,
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
    self: &mut EscrowFactory,
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
    assert!(self.is_dst_escrow_exists(order_hash), EDstEscrowExists);

    let taker = ctx.sender();

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

    let deposit_amount = coin::value(&deposit);
    let safety_deposit_amount = coin::value(&safety_deposit);

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

    let escrow_id = object::id(&escros);
    self.insert_dst_escrow(
        order_hash,
        escros,
    );

    self.emit_escrow_created_event(
        escrow_id,
        order_hash,
        hashlock,
        maker,
        taker,
        deposit_amount,
        safety_deposit_amount,
        maker,
    );
    // let dst_cancellation_timestamp = get from timelocks
    // assert!(dst_cancellation_timestamp > src_cancellation_timestamp, 0x1, EInvalidCreationTime);
}

fun insert_dst_escrow(self: &mut EscrowFactory, order_hash: vector<u8>, escrow: escrow::Escrow) {
    self.escrow_srcs.add(order_hash, escrow);
}

fun is_dst_escrow_exists(self: &EscrowFactory, order_hash: vector<u8>): bool {
    self.escrow_dsts.contains(order_hash)
}

fun emit_escrow_created_event(
    _: &EscrowFactory,
    escrow_id: ID,
    order_hash: vector<u8>,
    hashlock: vector<u8>,
    maker: address,
    receiver: address,
    source_amount: u64,
    target_amount: u64,
    resolver: address,
) {
    let event = EscrowCreated {
        escrow_id,
        order_hash,
        hashlock,
        maker,
        taker: receiver,
        amount: source_amount,
        safety_deposit: target_amount,
        resolver,
    };
    event::emit(event);
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
