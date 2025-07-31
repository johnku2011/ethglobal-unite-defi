#[test_only]
module sui_fusion_protocol::factory_tests;

use sui::{
    clock::{Self, Clock},
    coin,
    hash,
    test_scenario::{Self, take_shared, Scenario},
    test_utils
};
use sui_fusion_protocol::{factory, sui};

const MAKER: address = @0xAA;
const TAKER: address = @0xBA;
const RESOLVER: address = @0xCA;
const OTHER_RESOLVER: address = @0xDA;
const SECRET: vector<u8> = b"test_secret_32_bytes_long_1234567";

#[test_only]
fun setup_test(): (Scenario, vector<u8>, vector<u8>, vector<u8>, Clock) {
    let mut test = test_scenario::begin(MAKER);
    let clock = clock::create_for_testing(test.ctx());
    let secret = SECRET;
    let order_hash = b"order_hash_32_bytes_long_1234567";
    let hashlock = hash::keccak256(&secret);

    // test::next_tx(MAKER);

    (test, secret, order_hash, hashlock, clock)
}

#[test_only]
fun mint_sui_for_testing(
    sender: address,
    amount: u64,
    test: &mut Scenario,
): (
    coin::Coin<sui_fusion_protocol::sui::TEST_SUI>,
    coin::CoinMetadata<sui_fusion_protocol::sui::TEST_SUI>,
) {
    test.next_tx(sender);
    {
        let (mut treasury_cap, coin_metadata) = sui::create_currency(test.ctx());
        let coins = coin::mint(&mut treasury_cap, amount, test.ctx());

        transfer::public_transfer(treasury_cap, sender);

        (coins, coin_metadata)
    }
}

fun test_create_dst_escrow() {
    let (mut test, secret, order_hash, hashlock, clock) = setup_test();

    // mint_sui_for_testing(MAKER, 1_000_000_000, &mut test);

    factory::init_for_testing(test.ctx());

    // Define parameters for the escrow
    let order_hash = b"";
    let hashlock = b"";
    let maker = MAKER;

    // Define timelocks
    let src_withdrawal = 1000;
    let src_public_withdrawal = 2000;
    let src_cancellation = 3000;
    let src_public_cancellation = 4000;
    let dst_withdrawal = 5000;
    let dst_public_withdrawal = 6000;
    let dst_cancellation = 7000;

    // Call the create_dst_escrow function
    // sui_fusion_protocol::factory::create_dst_escrow(
    //     order_hash,
    //     hashlock,
    //     maker,
    //     deposit,
    //     safety_deposit,
    //     src_withdrawal,
    //     src_public_withdrawal,
    //     src_cancellation,
    //     src_public_cancellation,
    //     dst_withdrawal,
    //     dst_public_withdrawal,
    //     dst_cancellation,
    //     &clock,
    //     &mut ctx,
    // );

    clock::destroy_for_testing(clock);
    test_scenario::end(test);
}
