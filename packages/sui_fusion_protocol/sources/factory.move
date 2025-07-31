module sui_fusion_protocol::factory;

use std::{type_name::{Self, TypeName}, vector};
use sui::{
    clock::{Self, Clock},
    coin::{Self, Coin},
    event,
    hash,
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
const EInvalidTaker: u64 = 5;
const EInvalidSecret: u64 = 6;
const EInvalidTimestamp: u64 = 7;
// === Events ===

public struct EscrowCreated has copy, drop {
    escrow_id: ID,
    order_hash: vector<u8>,
    hashlock: vector<u8>,
    maker: address,
    taker: address,
    amount: u64,
    safety_deposit: u64,
}

public struct EscrowCancelled has copy, drop {
    escrow_id: ID,
    order_hash: vector<u8>,
}

public struct EscrowWithdrawn has copy, drop {
    escrow_id: ID,
    order_hash: vector<u8>,
    maker: address,
    taker: address,
    amount: u64,
    safety_deposit: u64,
}

// === Functions ===

fun init(ctx: &mut TxContext) {
    let factory = EscrowFactory {
        id: object::new(ctx),
        escrow_dsts: object_table::new(ctx),
        escrow_srcs: object_table::new(ctx),
    };

    transfer::share_object(factory);
}

// refund after time expired to user
// public fun refund<T>(
//     self: &mut EscrowFactory,
//     order_hash: vector<u8>,
//     clock: &Clock,
//     ctx: &mut TxContext,
// ) {
//     assert!(self.is_src_escrow_exists(order_hash), EInvalidOrderHash);
//     let mut escrow = self.escrow_srcs.remove(order_hash);

//     let now = clock::timestamp_ms(clock);
//     // check expired
//     let taker = escrow.taker();
//     let (deposit, safety_deposit) = escrow.withdraw<T>();

//     // transfer::public_transfer(deposit, taker);
//     // transfer::public_transfer(safety_deposit, taker);

//     escrow.destroy();
// }

#[allow(lint(self_transfer))]
public fun withdraw<T>(
    self: &mut EscrowFactory,
    order_hash: vector<u8>,
    secret: vector<u8>,
    is_src: bool,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let mut escrow = take_escrow(self, order_hash, is_src);
    assert!(escrow.is_taker(ctx.sender()), EInvalidTaker);

    let now = clock::timestamp_ms(clock);
    assert!(now >= escrow.timelocks().dst_public_withdrawal(), EInvalidTimestamp);
    assert!(now < escrow.timelocks().dst_cancellation(), EInvalidTimestamp);

    //  assert time after DstWithdrawal
    //  assert time before DstCancellation
    assert!(escrow.verify_secret(secret), EInvalidSecret);

    let taker = escrow.taker(); // it's for dst case
    let maker = escrow.maker(); // it's for src case
    let (despoit, safety_deposit) = escrow.withdraw<T>();

    let amount = despoit.value();
    let safety_deposit_amount = safety_deposit.value();
    let escrow_id = object::id(&escrow);

    transfer::public_transfer(despoit.into_coin(ctx), maker);
    transfer::public_transfer(safety_deposit.into_coin(ctx), taker);

    escrow.destroy();

    self.emit_escrow_withdrawn_event(
        escrow_id,
        order_hash,
        maker,
        taker,
        amount,
        safety_deposit_amount,
    );
    // let taker = if (is_src) {
    //     escrow.maker()
    // } else {
    //     escrow.taker()
    // }; let (despoit, safety_deposit) = escrow.withdraw<T>(ctx); transfer::public_transfer(despoit, taker); transfer::public_transfer(safety_deposit, taker); escrow.destroy();
}

public fun cancel<T>(
    self: &mut EscrowFactory,
    order_hash: vector<u8>,
    is_src: bool,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let mut escrow = take_escrow(self, order_hash, is_src);
    assert!(escrow.is_taker(ctx.sender()), EInvalidTaker);

    let now = clock::timestamp_ms(clock);
    assert!(now >= escrow.timelocks().dst_cancellation(), EInvalidTimestamp);

    let escrow_id = object::id(&escrow);
    // emit cancelled event

    let (deposit, safety_deposit) = escrow.withdraw<T>();

    let taker = escrow.taker(); // it's for dst case
    // let maker = escrow.maker(); // it's for src case

    transfer::public_transfer(deposit.into_coin(ctx), taker);
    transfer::public_transfer(safety_deposit.into_coin(ctx), ctx.sender());

    escrow.destroy();

    self.emit_escrow_cancelled_event(escrow_id, order_hash);
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
        // ctx.sender(), // resolver is the sender in this case
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
    );
    // let dst_cancellation_timestamp = get from timelocks
    // assert!(dst_cancellation_timestamp > src_cancellation_timestamp, 0x1, EInvalidCreationTime);
}

fun insert_dst_escrow(self: &mut EscrowFactory, order_hash: vector<u8>, escrow: escrow::Escrow) {
    // self.escrow_srcs.add(hash::keccak256(&order_hash), escrow);
    self.escrow_srcs.add(order_hash, escrow);
}

fun is_dst_escrow_exists(self: &EscrowFactory, order_hash: vector<u8>): bool {
    self.escrow_dsts.contains(order_hash)
}

fun is_src_escrow_exists(self: &EscrowFactory, order_hash: vector<u8>): bool {
    self.escrow_srcs.contains(hash::keccak256(&order_hash))
}

fun emit_escrow_cancelled_event(_: &EscrowFactory, escrow_id: ID, order_hash: vector<u8>) {
    let event = EscrowCancelled {
        escrow_id,
        order_hash,
    };
    event::emit(event);
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
) {
    let event = EscrowCreated {
        escrow_id,
        order_hash,
        hashlock,
        maker,
        taker: receiver,
        amount: source_amount,
        safety_deposit: target_amount,
    };
    event::emit(event);
}

fun emit_escrow_withdrawn_event(
    _: &EscrowFactory,
    escrow_id: ID,
    order_hash: vector<u8>,
    maker: address,
    taker: address,
    amount: u64,
    safety_deposit: u64,
) {
    let event = EscrowWithdrawn {
        escrow_id,
        order_hash,
        maker,
        taker,
        amount,
        safety_deposit,
    };
    event::emit(event);
}

fun take_escrow(self: &mut EscrowFactory, order_hash: vector<u8>, is_src: bool): escrow::Escrow {
    if (is_src) {
        assert!(self.escrow_srcs.contains(order_hash), EInvalidOrderHash);
        self.escrow_srcs.remove(order_hash)
    } else {
        assert!(self.escrow_dsts.contains(order_hash), EInvalidOrderHash);
        self.escrow_dsts.remove(order_hash)
    }
}

#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(ctx);
}
