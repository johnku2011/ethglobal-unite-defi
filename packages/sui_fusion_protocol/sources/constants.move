module sui_fusion_protocol::constants;

const MIN_SAFETY_DEPOSIT: u64 = 10_000_000;
const ACTIVE: u8 = 1;
const WITHDRAWN: u8 = 2;
const CANCELLED: u8 = 3;

public fun min_safety_deposit(): u64 {
    MIN_SAFETY_DEPOSIT
}

public fun active(): u8 {
    ACTIVE
}

public fun withdrawn(): u8 {
    WITHDRAWN
}

public fun cancelled(): u8 {
    CANCELLED
}
