#[test_only]
module sui_fusion_protocol::sui;

use sui::coin::{Self, TreasuryCap, CoinMetadata};

public struct TEST_SUI has drop {}

#[test_only]
public fun create_currency(ctx: &mut TxContext): (TreasuryCap<TEST_SUI>, CoinMetadata<TEST_SUI>) {
    coin::create_currency(
        TEST_SUI {},
        9,
        vector::empty(),
        vector::empty(),
        vector::empty(),
        option::none(),
        ctx,
    )
}
