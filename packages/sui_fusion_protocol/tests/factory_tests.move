#[test_only]
module sui_fusion_protocol::factory_tests;

use sui::{
    clock::{Self, Clock},
    coin,
    hash,
    sui::SUI,
    test_scenario::{Self, take_shared, Scenario},
    test_utils
};
use sui_fusion_protocol::factory;

const MAKER: address = @0xAA;
const RESOLVER: address = @0xCA;
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

#[test_only]
fun setup_resolvers(test: &mut Scenario): (factory::ResolverOwnerCap) {
    test.next_tx(RESOLVER);

    let mut escrow_factory = test.take_shared<factory::EscrowFactory>();
    // let resolver = resolver::create_resolver_for_testing(object::id(&escrow_factory), test.ctx());

    let cap = factory::regsiter_resolver(&mut escrow_factory, test.ctx());
    test_scenario::return_shared(escrow_factory);

    (cap)
}

#[test]
fun test_create_src_escrow() {
    let (mut test, _secret, order_hash, hashlock, clock) = setup_test();

    factory::init_for_testing(test.ctx());

    let cap = setup_resolvers(&mut test);

    let (sui) = create_src_escrow_for_testing(
        &mut test,
        &cap,
        order_hash,
        hashlock,
        &clock,
    );

    test.next_tx(MAKER);

    let escrow_factory = test.take_shared<factory::EscrowFactory>();
    let escrow = factory::find_escrow_for_testing(
        &escrow_factory,
        order_hash,
        true,
    );
    assert!(escrow.amount() == 100_000_000, 1);
    assert!(escrow.safety_deposit_amount() == 10_000_000, 1);
    test_scenario::return_shared(escrow_factory);

    clock::destroy_for_testing(clock);
    sui.burn_for_testing();
    test_utils::destroy(cap);
    test_scenario::end(test);
}

#[test]
fun test_withdraw_dst_escrow() {
    let (mut test, secret, order_hash, hashlock, mut clock) = setup_test();

    factory::init_for_testing(test.ctx());

    let cap = setup_resolvers(&mut test);

    let sui = create_dst_escrow_for_testing(
        &mut test,
        &cap,
        order_hash,
        hashlock,
        &clock,
    );

    test.next_tx(RESOLVER);

    let mut escrow_factory = test.take_shared<factory::EscrowFactory>();
    let escrow = factory::find_escrow_for_testing(
        &escrow_factory,
        order_hash,
        false,
    );
    assert!(escrow.amount() == 100_000_000, 1);
    assert!(escrow.safety_deposit_amount() == 10_000_000, 1);

    clock::set_for_testing(&mut clock, PUBLIC_WITHDRAWAL_DST_TIMELOCK + 100);

    factory::withdraw_dst<SUI>(
        &mut escrow_factory,
        order_hash,
        secret,
        &clock,
        test.ctx(),
    );

    test.next_tx(RESOLVER);
    let sui_coins_maker = test.take_from_address<coin::Coin<SUI>>(MAKER);
    let sui_coins_resolver = test.take_from_address<coin::Coin<SUI>>(RESOLVER);

    assert!(coin::value(&sui_coins_maker) == 100_000_000, 1);
    assert!(coin::value(&sui_coins_resolver) == 10_000_000, 1);

    sui.burn_for_testing();
    clock::destroy_for_testing(clock);
    test_scenario::return_to_address(MAKER, sui_coins_maker);
    test_scenario::return_to_address(RESOLVER, sui_coins_resolver);
    test_utils::destroy(cap);
    test_scenario::return_shared(escrow_factory);
    test_scenario::end(test);
}

#[test]
fun test_create_dst_escrow() {
    let (mut test, _secret, order_hash, hashlock, clock) = setup_test();

    factory::init_for_testing(test.ctx());

    let cap = setup_resolvers(&mut test);

    let (sui) = create_dst_escrow_for_testing(
        &mut test,
        &cap,
        order_hash,
        hashlock,
        &clock,
    );

    clock::destroy_for_testing(clock);
    sui.burn_for_testing();
    test_utils::destroy(cap);
    test_scenario::end(test);
}

#[test_only]
use std::debug;
#[test]
fun test_cancel_dst_escrow() {
    let (mut test, _secret, order_hash, hashlock, mut clock) = setup_test();

    factory::init_for_testing(test.ctx());

    let cap = setup_resolvers(&mut test);

    let sui = create_dst_escrow_for_testing(
        &mut test,
        &cap,
        order_hash,
        hashlock,
        &clock,
    );

    test.next_tx(RESOLVER);

    let mut escrow_factory = test.take_shared<factory::EscrowFactory>();
    clock::set_for_testing(&mut clock, CANCELLATION_DST_TIMELOCK + 100);

    factory::cancel_dst<SUI>(
        &mut escrow_factory,
        order_hash,
        &clock,
        test.ctx(),
    );

    test.next_tx(RESOLVER);
    let sui_coins_1 = test.take_from_address<coin::Coin<SUI>>(RESOLVER);
    let sui_coins_2 = test.take_from_address<coin::Coin<SUI>>(RESOLVER);

    let total_value = coin::value(&sui_coins_1) + coin::value(&sui_coins_2);

    assert!(total_value == 110_000_000, 1);

    sui.burn_for_testing();
    clock::destroy_for_testing(clock);
    test_scenario::return_to_address(RESOLVER, sui_coins_1);
    test_scenario::return_to_address(RESOLVER, sui_coins_2);
    test_utils::destroy(cap);
    test_scenario::end(test);
    test_scenario::return_shared(escrow_factory);
}

#[test]
fun test_withdraw_src_escrow() {
    let (mut test, secret, order_hash, hashlock, mut clock) = setup_test();

    factory::init_for_testing(test.ctx());

    let cap = setup_resolvers(&mut test);

    let (sui) = create_src_escrow_for_testing(
        &mut test,
        &cap,
        order_hash,
        hashlock,
        &clock,
    );

    test.next_tx(RESOLVER);

    let mut escrow_factory = test.take_shared<factory::EscrowFactory>();
    clock::set_for_testing(&mut clock, PUBLIC_WITHDRAWAL_DST_TIMELOCK + 100);

    factory::withdraw_src<SUI>(
        &mut escrow_factory,
        order_hash,
        secret,
        &clock,
        test.ctx(),
    );

    test.next_tx(RESOLVER);
    let sui_coins_1 = test.take_from_address<coin::Coin<SUI>>(RESOLVER);
    let sui_coins_2 = test.take_from_address<coin::Coin<SUI>>(RESOLVER);
    let total_value = coin::value(&sui_coins_1) + coin::value(&sui_coins_2);
    assert!(total_value== 110_000_000, 1);

    sui.burn_for_testing();
    clock::destroy_for_testing(clock);
    test_scenario::return_to_address(RESOLVER, sui_coins_1);
    test_scenario::return_to_address(RESOLVER, sui_coins_2);
    test_utils::destroy(cap);
    test_scenario::return_shared(escrow_factory);
    test_scenario::end(test);
}

#[test]
fun test_cancel_src_escrow() {
    let (mut test, _secret, order_hash, hashlock, mut clock) = setup_test();

    factory::init_for_testing(test.ctx());

    let cap = setup_resolvers(&mut test);
    let (sui) = create_src_escrow_for_testing(
        &mut test,
        &cap,
        order_hash,
        hashlock,
        &clock,
    );

    test.next_tx(RESOLVER);

    let mut escrow_factory = test.take_shared<factory::EscrowFactory>();
    clock::set_for_testing(&mut clock, CANCELLATION_SRC_TIMELOCK + 1000);

    factory::cancel_src<SUI>(
        &mut escrow_factory,
        order_hash,
        &clock,
        test.ctx(),
    );

    test.next_tx(RESOLVER);
    let sui_coins_maker = test.take_from_address<coin::Coin<SUI>>(MAKER);
    let sui_coins_resolver = test.take_from_address<coin::Coin<SUI>>(RESOLVER);

    assert!(coin::value(&sui_coins_maker) == 100_000_000, 1);
    assert!(coin::value(&sui_coins_resolver) == 10_000_000, 1);

    sui.burn_for_testing();
    clock::destroy_for_testing(clock);
    test_scenario::return_to_address(MAKER, sui_coins_maker);
    test_scenario::return_to_address(RESOLVER, sui_coins_resolver);
    test_utils::destroy(cap);
    test_scenario::return_shared(escrow_factory);
    test_scenario::end(test);
}

#[test_only]
fun create_dst_escrow_for_testing(
    test: &mut Scenario,
    cap: &factory::ResolverOwnerCap,
    order_hash: vector<u8>,
    hashlock: vector<u8>,
    clock: &Clock,
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
        10_000_000,
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
        cap,
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
    resolver_owner_cap: &factory::ResolverOwnerCap,
    order_hash: vector<u8>,
    hashlock: vector<u8>,
    clock: &Clock,
): (coin::Coin<SUI>) {
    test.next_tx(MAKER);

    let mut sui = coin::mint_for_testing<SUI>(10_000_000_000, test.ctx());

    // let maker = MAKER; // equals deployer
    // let taker = RESOLVER;

    let deposit = sui.split(
        100_000_000,
        test.ctx(),
    );

    let safety_deposit = sui.split(
        10_000_000,
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
        resolver_owner_cap,
        order_hash,
        hashlock,
        MAKER,
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
