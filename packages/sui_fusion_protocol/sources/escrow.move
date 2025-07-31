module sui_fusion_protocol::escrow;

use std::{type_name::{Self, TypeName}, vector};
use sui::{
    balance::Balance,
    clock::Clock,
    coin::{Self, Coin},
    dynamic_field,
    object_table::ObjectTable,
    sui::SUI
};
use sui_fusion_protocol::timelock::Timelocks;

public struct Escrow has key, store {
    id: UID,
    status: u8, // 1: Active, 2: Withdrawn, 3: Cancelled
    coin_type: TypeName,
    order_hash: vector<u8>,
    hashlock: vector<u8>,
    maker: address,
    taker: address,
    amount: u64, // Amount of tokens to be swapped
    safety_deposit_amount: u64, // Safety deposit amount in SUI (paid by resolver)
    resolver: address, // Address of the resolver
    timelocks: Timelocks,
}

public struct EscrowBalanceKey has copy, drop, store {}

public struct Balances<phantom T> has store {
    deposit: Balance<T>,
    safety_deposit: Balance<SUI>,
}

public fun create<Token>(
    order_hash: vector<u8>,
    hashlock: vector<u8>,
    maker: address,
    taker: address,
    deposit: Coin<Token>,
    safety_deposit: Coin<SUI>,
    resolver: address,
    timelocks: Timelocks,
    ctx: &mut TxContext,
): Escrow {
    let mut escrow = Escrow {
        id: object::new(ctx),
        status: 1, // Active
        coin_type: type_name::get<Token>(),
        order_hash,
        hashlock,
        maker,
        taker,
        amount: coin::value(&deposit),
        safety_deposit_amount: coin::value(&safety_deposit),
        resolver,
        timelocks,
    };

    dynamic_field::add(
        &mut escrow.id,
        EscrowBalanceKey {},
        Balances<Token> {
            deposit: deposit.into_balance(),
            safety_deposit: safety_deposit.into_balance(),
        },
    );

    escrow
}

// EscrowSrc clones hold the user's tokens and EscrowDst clones hold the resolver's tokens. Both allow tokens to be withdrawn to the recipient.
