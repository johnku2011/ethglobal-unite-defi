module sui_fusion_protocol::factory;

use sui::{
    clock::{Self, Clock},
    coin::{Self, Coin},
    event,
    hash,
    object_table::{Self, ObjectTable},
    sui::SUI
};
use sui_fusion_protocol::{
    constants,
    escrow,
    resolver::{Self, Resolver},
    timelock::{Self, src_cancellation}
};

// === Structs ===
public struct EscrowFactory has key, store {
    id: UID,
    escrow_dsts: ObjectTable<vector<u8>, escrow::Escrow>,
    escrow_srcs: ObjectTable<vector<u8>, escrow::Escrow>,
    resolvers: ObjectTable<ID, Resolver>,
}

public struct ResolverOwnerCap has key, store {
    id: UID,
    resolver_id: ID,
}

// === Errors ===
const EInvalidCreationTime: u64 = 1;
const EInvalidOrderHash: u64 = 2;
const EInvalidHashlock: u64 = 3;
const EDstEscrowExists: u64 = 4;
const EInvalidTaker: u64 = 5;
const EInvalidSecret: u64 = 6;
const EInvalidTimestamp: u64 = 7;
const ESafetyDepositTooLow: u64 = 8;
// const EResolverAlreadyRegistered: u64 = 9;
const EResolverNotFound: u64 = 10;

// === Events ===
public struct EscrowCreated has copy, drop {
    escrow_id: ID,
    order_hash: vector<u8>,
    // hashlock: vector<u8>,
    maker: address,
    taker: address,
    amount: u64,
    // safety_deposit: u64,
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
        resolvers: object_table::new(ctx),
    };

    transfer::share_object(factory);
}

// === Public Functions ===
public fun regsiter_resolver(self: &mut EscrowFactory, ctx: &mut TxContext): ResolverOwnerCap {
    let escrow_factory_id = object::id(self);
    let resolver = resolver::create_resolver(escrow_factory_id, ctx);

    let cap = ResolverOwnerCap {
        id: object::new(ctx),
        resolver_id: object::id(&resolver),
    };

    let resolver_id = object::id(&resolver);

    self.resolvers.add(resolver_id, resolver);

    cap
    // transfer::public_transfer(cap, ctx.sender())
}

public fun withdraw_src<T>(
    self: &mut EscrowFactory,
    order_hash: vector<u8>,
    secret: vector<u8>,
    // is_src: bool,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let mut escrow = take_escrow(self, order_hash, true);
    let sender = ctx.sender();
    assert!(escrow.is_taker(sender), EInvalidTaker);

    let now = clock::timestamp_ms(clock);
    assert!(now >= escrow.timelocks().src_withdrawal(), EInvalidTimestamp);
    assert!(now < escrow.timelocks().src_cancellation(), EInvalidTimestamp);
    assert!(escrow.verify_secret(secret), EInvalidSecret);

    let taker = escrow.taker(); // resolver
    let maker = escrow.maker(); // user
    let (despoit, safety_deposit) = escrow.withdraw<T>();

    let amount = despoit.value();
    let safety_deposit_amount = safety_deposit.value();
    let escrow_id = object::id(&escrow);

    transfer::public_transfer(despoit.into_coin(ctx), taker);
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
}

public fun withdraw_dst<T>(
    self: &mut EscrowFactory,
    order_hash: vector<u8>,
    secret: vector<u8>,
    // is_src: bool,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let mut escrow = take_escrow(self, order_hash, false);
    assert!(escrow.is_taker(ctx.sender()), EInvalidTaker);

    let now = clock::timestamp_ms(clock);
    assert!(now >= escrow.timelocks().dst_public_withdrawal(), EInvalidTimestamp);
    assert!(now < escrow.timelocks().dst_cancellation(), EInvalidTimestamp);
    assert!(escrow.verify_secret(secret), EInvalidSecret);

    let taker = escrow.taker();
    let maker = escrow.maker();
    let (despoit, safety_deposit) = escrow.withdraw<T>();

    let amount = despoit.value();
    let safety_deposit_amount = safety_deposit.value();
    let escrow_id = object::id(&escrow);

    transfer::public_transfer(despoit.into_coin(ctx), maker); // transfer to user
    transfer::public_transfer(safety_deposit.into_coin(ctx), taker); // transfer to resolver

    escrow.destroy();

    self.emit_escrow_withdrawn_event(
        escrow_id,
        order_hash,
        maker,
        taker,
        amount,
        safety_deposit_amount,
    );
}

public fun cancel_src<T>(
    self: &mut EscrowFactory,
    order_hash: vector<u8>,
    // is_src: bool,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let mut escrow = take_escrow(self, order_hash, true);
    assert!(escrow.is_taker(ctx.sender()), EInvalidTaker);

    let now = clock::timestamp_ms(clock);
    assert!(now >= escrow.timelocks().src_cancellation(), EInvalidTimestamp);

    let escrow_id = object::id(&escrow);
    // emit cancelled event

    let (deposit, safety_deposit) = escrow.withdraw<T>();

    let taker = escrow.taker(); //
    let maker = escrow.maker(); //

    transfer::public_transfer(deposit.into_coin(ctx), maker);
    transfer::public_transfer(safety_deposit.into_coin(ctx), taker);

    escrow.destroy();

    self.emit_escrow_cancelled_event(escrow_id, order_hash);
}

public fun cancel_dst<T>(
    self: &mut EscrowFactory,
    order_hash: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let mut escrow = take_escrow(self, order_hash, false);
    assert!(escrow.is_taker(ctx.sender()), EInvalidTaker);

    let now = clock::timestamp_ms(clock);
    assert!(now >= escrow.timelocks().dst_cancellation(), EInvalidTimestamp);

    let escrow_id = object::id(&escrow);
    // emit cancelled event

    let (deposit, safety_deposit) = escrow.withdraw<T>();

    let taker = escrow.taker(); // it's for dst case
    // let maker = escrow.maker(); // it's for src case

    transfer::public_transfer(deposit.into_coin(ctx), taker);
    transfer::public_transfer(safety_deposit.into_coin(ctx), taker);

    escrow.destroy();

    self.emit_escrow_cancelled_event(escrow_id, order_hash);
}

public fun create_src_escrow<Token>(
    self: &mut EscrowFactory,
    resolver_owner_cap: &ResolverOwnerCap,
    order_hash: vector<u8>,
    hashlock: vector<u8>,
    maker: address,
    source_coin: Coin<Token>,
    safety_deposit: Coin<SUI>,
    src_withdrawal: u64,
    src_public_withdrawal: u64,
    src_cancellation: u64,
    src_public_cancellation: u64,
    dst_withdrawal: u64,
    dst_public_withdrawal: u64,
    dst_cancellation: u64,
    clock: &Clock,
    ctx: &mut TxContext,
): ID {
    assert!(vector::length(&order_hash) == 32, EInvalidOrderHash);
    assert!(vector::length(&hashlock) == 32, EInvalidHashlock);
    assert!(!self.is_src_escrow_exists(order_hash), EDstEscrowExists);

    let safety_deposit_amount = coin::value(&safety_deposit);
    assert!(safety_deposit_amount >= constants::min_safety_deposit(), ESafetyDepositTooLow);

    let resolver = find_resolver(self, resolver_owner_cap);
    let taker = resolver.maker();
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
    let source_amount = coin::value(&source_coin);
    let escros = escrow::create<Token>(
        order_hash,
        hashlock,
        maker,
        taker,
        source_coin,
        safety_deposit,
        timelocks,
        ctx,
    );

    let escrow_id = object::id(&escros);
    self.insert_src_escrow(
        order_hash,
        escros,
    );

    self.emit_escrow_created_event(
        escrow_id,
        order_hash,
        maker,
        taker,
        source_amount,
    );
    escrow_id
}

// Create a new destination escrow
public fun create_dst_escrow<Token>(
    self: &mut EscrowFactory,
    resolver_owner_cap: &ResolverOwnerCap,
    order_hash: vector<u8>,
    hashlock: vector<u8>,
    maker: address, // user address
    deposit: Coin<Token>,
    safety_deposit: Coin<SUI>,
    src_withdrawal: u64,
    src_public_withdrawal: u64,
    src_cancellation: u64,
    src_public_cancellation: u64,
    dst_withdrawal: u64,
    dst_public_withdrawal: u64,
    dst_cancellation: u64,
    clock: &Clock,
    ctx: &mut TxContext,
): ID {
    assert!(vector::length(&order_hash) == 32, EInvalidOrderHash);
    assert!(vector::length(&hashlock) == 32, EInvalidHashlock);
    assert!(!self.is_dst_escrow_exists(order_hash), EDstEscrowExists);

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

    assert!(timelocks.dst_cancellation() < src_cancellation, EInvalidCreationTime);

    let resolver = find_resolver(self, resolver_owner_cap);
    let taker = resolver.maker();
    let deposit_amount = coin::value(&deposit);
    let safety_deposit_amount = coin::value(&safety_deposit);

    assert!(safety_deposit_amount >= constants::min_safety_deposit(), ESafetyDepositTooLow);

    let escros = escrow::create<Token>(
        order_hash,
        hashlock,
        maker,
        taker,
        deposit,
        safety_deposit,
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
        // hashlock,
        maker,
        taker,
        deposit_amount,
        // safety_deposit_amount,
    );

    escrow_id
}

fun insert_dst_escrow(self: &mut EscrowFactory, order_hash: vector<u8>, escrow: escrow::Escrow) {
    self.escrow_dsts.add(order_hash, escrow);
}

fun insert_src_escrow(self: &mut EscrowFactory, order_hash: vector<u8>, escrow: escrow::Escrow) {
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
    // hashlock: vector<u8>,
    maker: address,
    receiver: address,
    amount: u64,
    // target_amount: u64,
) {
    let event = EscrowCreated {
        escrow_id,
        order_hash,
        // hashlock,
        maker,
        taker: receiver,
        amount: amount,
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

fun find_resolver(self: &EscrowFactory, resolver_owner_cap: &ResolverOwnerCap): &Resolver {
    let resolver_id = resolver_owner_cap.resolver_id;
    assert!(self.resolvers.contains(resolver_id), EResolverNotFound);
    self.resolvers.borrow(resolver_id)
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

#[test_only]
public fun find_escrow_for_testing(
    self: &EscrowFactory,
    order_hash: vector<u8>,
    is_src: bool,
): &escrow::Escrow {
    if (is_src) {
        assert!(self.escrow_srcs.contains(order_hash), EInvalidOrderHash);
        self.escrow_srcs.borrow(order_hash)
    } else {
        assert!(self.escrow_dsts.contains(order_hash), EInvalidOrderHash);
        self.escrow_dsts.borrow(order_hash)
    }
}
