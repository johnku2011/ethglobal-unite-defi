#[test_only]
module sui_fusion_protocol::factory_tests;

use sui::{clock::{Self, Clock}, coin, hash, sui::SUI, test_scenario::{Self, take_shared, Scenario}};
use sui_fusion_protocol::factory;

const MAKER: address = @0xAA;
// const TAKER: address = @0xBA;
const RESOLVER: address = @0xCA;
// const OTHER_RESOLVER: address = @0xDA;
const WITHDRAWAL_SRC_TIMELOCK: u64 = 300;
const PUBLIC_WITHDRAWAL_SRC_TIMELOCK: u64 = 600;
const CANCELLATION_SRC_TIMELOCK: u64 = 900;
const PUBLIC_CANCELLATION_SRC_TIMELOCK: u64 = 1200;
const WITHDRAWAL_DST_TIMELOCK: u64 = 300;
const PUBLIC_WITHDRAWAL_DST_TIMELOCK: u64 = 600;
const CANCELLATION_DST_TIMELOCK: u64 = 900;
const SECRET: vector<u8> = b"test_secret_32_bytes_long_1234567";

#[test_only]
fun setup_test(): (Scenario, vector<u8>, vector<u8>, vector<u8>, Clock) {
    let mut test = test_scenario::begin(MAKER);
    let clock = clock::create_for_testing(test.ctx());
    let secret = SECRET;
    let order_hash = b"order_hash_32_bytes_long_1234567";
    let hashlock = hash::keccak256(&secret);

    (test, secret, order_hash, hashlock, clock)
}

// #[test_only]
// fun mint_sui_for_testing(
//     sender: address,
//     amount: u64,
//     test: &mut Scenario,
// ): (
//     coin::Coin<sui_fusion_protocol::sui::TEST_SUI>,
//     coin::CoinMetadata<sui_fusion_protocol::sui::TEST_SUI>,
// ) {
//     test.next_tx(sender);
//     {
//         let (mut treasury_cap, coin_metadata) = sui::create_currency(test.ctx());
//         let coins = coin::mint(&mut treasury_cap, amount, test.ctx());

//         transfer::public_transfer(treasury_cap, sender);

//         (coins, coin_metadata)
//     }
// }

#[test]
fun test_create_src_escrow() {
    let (mut test, secret, order_hash, hashlock, clock) = setup_test();

    factory::init_for_testing(test.ctx());

    let (sui) = create_src_escrow_for_testing(
        &mut test,
        order_hash,
        hashlock,
        &clock,
    );

    clock::destroy_for_testing(clock);
    sui.burn_for_testing();
    test_scenario::end(test);
}

#[test]
fun test_create_dst_escrow() {
    let (mut test, secret, order_hash, hashlock, clock) = setup_test();

    factory::init_for_testing(test.ctx());

    let (sui) = create_dst_escrow_for_testing(
        &mut test,
        order_hash,
        hashlock,
        &clock,
    );

    clock::destroy_for_testing(clock);
    sui.burn_for_testing();
    test_scenario::end(test);
}

#[test]
fun test_cancel_dst_escrow() {
    let (mut test, secret, order_hash, hashlock, mut clock) = setup_test();

    factory::init_for_testing(test.ctx());

    let sui = create_dst_escrow_for_testing(
        &mut test,
        order_hash,
        hashlock,
        &clock,
    );

    test.next_tx(RESOLVER);

    let mut escrow_factory = test.take_shared<factory::EscrowFactory>();
    clock::set_for_testing(&mut clock, CANCELLATION_DST_TIMELOCK + 100);

    factory::cancel<SUI>(
        &mut escrow_factory,
        order_hash,
        false,
        &clock,
        test.ctx(),
    );

    sui.burn_for_testing();
    clock::destroy_for_testing(clock);
    test_scenario::end(test);
    test_scenario::return_shared(escrow_factory);
}

#[test]
fun test_withdraw_dst_escrow() {
    let (mut test, secret, order_hash, hashlock, mut clock) = setup_test();

    factory::init_for_testing(test.ctx());

    let sui = create_dst_escrow_for_testing(
        &mut test,
        order_hash,
        hashlock,
        &clock,
    );

    test.next_tx(RESOLVER);

    let mut escrow_factory = test.take_shared<factory::EscrowFactory>();
    clock::set_for_testing(&mut clock, PUBLIC_WITHDRAWAL_DST_TIMELOCK + 100);

    factory::withdraw<SUI>(
        &mut escrow_factory,
        order_hash,
        secret,
        false,
        &clock,
        test.ctx(),
    );

    sui.burn_for_testing();
    clock::destroy_for_testing(clock);
    test_scenario::end(test);
    test_scenario::return_shared(escrow_factory);
}

#[test_only]
fun create_dst_escrow_for_testing(
    test: &mut Scenario,
    order_hash: vector<u8>,
    hashlock: vector<u8>,
    clock: &Clock,
    // ctx: &mut Scenario,
): (coin::Coin<SUI>) {
    test.next_tx(RESOLVER);

    let mut sui = coin::mint_for_testing<SUI>(10_000_000_000, test.ctx());

    let maker = MAKER; // equals deployer
    // let taker = resolver

    let deposit = sui.split(
        100_000_000,
        test.ctx(),
    );

    let safety_deposit = sui.split(
        100_000_000,
        test.ctx(),
    );

    let src_withdrawal = WITHDRAWAL_SRC_TIMELOCK;
    let src_public_withdrawal = PUBLIC_WITHDRAWAL_SRC_TIMELOCK;
    let src_cancellation = CANCELLATION_SRC_TIMELOCK + 1000;
    let src_public_cancellation = PUBLIC_CANCELLATION_SRC_TIMELOCK;
    let dst_withdrawal = WITHDRAWAL_DST_TIMELOCK;
    let dst_public_withdrawal = PUBLIC_WITHDRAWAL_DST_TIMELOCK;
    let dst_cancellation = CANCELLATION_DST_TIMELOCK;

    let mut escrow_factory = test.take_shared<factory::EscrowFactory>();

    // Call the create_dst_escrow function
    factory::create_dst_escrow<SUI>(
        &mut escrow_factory,
        order_hash,
        hashlock,
        maker,
        deposit,
        safety_deposit,
        src_withdrawal,
        src_public_withdrawal,
        src_cancellation,
        src_public_cancellation,
        dst_withdrawal,
        dst_public_withdrawal,
        dst_cancellation,
        clock,
        test.ctx(),
    );

    test_scenario::return_shared(escrow_factory);
    (sui)
}

#[test_only]
fun create_src_escrow_for_testing(
    test: &mut Scenario,
    order_hash: vector<u8>,
    hashlock: vector<u8>,
    clock: &Clock,
    // ctx: &mut Scenario,
): (coin::Coin<SUI>) {
    test.next_tx(RESOLVER);

    let mut sui = coin::mint_for_testing<SUI>(10_000_000_000, test.ctx());

    let maker = MAKER; // equals deployer
    // let taker = resolver

    let deposit = sui.split(
        100_000_000,
        test.ctx(),
    );

    let safety_deposit = sui.split(
        100_000_000,
        test.ctx(),
    );

    let src_withdrawal = WITHDRAWAL_SRC_TIMELOCK;
    let src_public_withdrawal = PUBLIC_WITHDRAWAL_SRC_TIMELOCK;
    let src_cancellation = CANCELLATION_SRC_TIMELOCK + 1000;
    let src_public_cancellation = PUBLIC_CANCELLATION_SRC_TIMELOCK;
    let dst_withdrawal = WITHDRAWAL_DST_TIMELOCK;
    let dst_public_withdrawal = PUBLIC_WITHDRAWAL_DST_TIMELOCK;
    let dst_cancellation = CANCELLATION_DST_TIMELOCK;

    let mut escrow_factory = test.take_shared<factory::EscrowFactory>();

    // Call the create_dst_escrow function
    factory::create_src_escrow<SUI>(
        &mut escrow_factory,
        order_hash,
        hashlock,
        maker,
        deposit,
        safety_deposit,
        src_withdrawal,
        src_public_withdrawal,
        src_cancellation,
        src_public_cancellation,
        dst_withdrawal,
        dst_public_withdrawal,
        dst_cancellation,
        clock,
        test.ctx(),
    );

    test_scenario::return_shared(escrow_factory);
    (sui)
}
