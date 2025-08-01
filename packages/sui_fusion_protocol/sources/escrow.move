module sui_fusion_protocol::escrow;

use std::type_name::{Self, TypeName};
use sui::{balance::Balance, coin::{Self, Coin}, dynamic_field, hash, sui::SUI};
use sui_fusion_protocol::timelock::Timelocks;

public struct Escrow has key, store {
    id: UID,
    status: u8, // 1: Active, 2: Withdrawn, 3: Cancelled
    coin_type: TypeName,
    order_hash: vector<u8>,
    hashlock: vector<u8>, // Hash of the secret.
    maker: address,
    taker: address,
    amount: u64, // Amount of tokens to be swapped
    safety_deposit_amount: u64, // Safety deposit amount in SUI (paid by resolver)
    // resolver: address, // Address of the resolver
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
    // resolver: address,
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
        // resolver,
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

public(package) fun destroy(self: Escrow) {
    let Escrow { id, .. } = self;

    id.delete();
}

public(package) fun withdraw<T>(self: &mut Escrow): (Balance<T>, Balance<SUI>) {
    let Balances<T> {
        deposit,
        safety_deposit,
    } = dynamic_field::remove(
        &mut self.id,
        EscrowBalanceKey {},
    );

    (deposit, safety_deposit)
}

public fun amount(self: &Escrow): u64 {
    self.amount
}

public fun safety_deposit_amount(self: &Escrow): u64 {
    self.safety_deposit_amount
}

public fun maker(self: &Escrow): address {
    self.maker
}

public fun taker(self: &Escrow): address {
    self.taker
}

public fun is_active(self: &Escrow): bool {
    self.status == 1
}

public fun is_withdrawn(self: &Escrow): bool {
    self.status == 2
}

public fun is_cancelled(self: &Escrow): bool {
    self.status == 3
}

public fun set_status(self: &mut Escrow, status: u8) {
    self.status = status;
}

public fun timelocks(self: &Escrow): &Timelocks {
    &self.timelocks
}

public fun is_taker(self: &Escrow, sender: address): bool {
    self.taker == sender
}

public fun verify_secret(self: &Escrow, secret: vector<u8>): bool {
    // Assuming hashlock is a keccak256 hash of the secret
    let expected_hash = hash::keccak256(&secret);
    self.hashlock == expected_hash
}

// public fun balances<Token>(self: &mut Escrow): &mut Balances<Token> {
//     dynamic_field::borrow_mut(&mut self.id, EscrowBalanceKey {})
// }
// EscrowSrc clones hold the user's tokens and EscrowDst clones hold the resolver's tokens. Both allow tokens to be withdrawn to the recipient.
