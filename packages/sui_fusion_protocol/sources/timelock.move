module sui_fusion_protocol::timelock;

public struct Timelocks has copy, drop, store {
    deployed_at: u64,
    src_withdrawal: u64,
    src_public_withdrawal: u64,
    src_cancellation: u64,
    src_public_cancellation: u64,
    dst_withdrawal: u64,
    dst_public_withdrawal: u64,
    dst_cancellation: u64,
}

public fun new(): Timelocks {
    Timelocks {
        deployed_at: 0,
        src_withdrawal: 0,
        src_public_withdrawal: 0,
        src_cancellation: 0,
        src_public_cancellation: 0,
        dst_withdrawal: 0,
        dst_public_withdrawal: 0,
        dst_cancellation: 0,
    }
}

public fun create(
    deployed_at: u64,
    src_withdrawal: u64,
    src_public_withdrawal: u64,
    src_cancellation: u64,
    src_public_cancellation: u64,
    dst_withdrawal: u64,
    dst_public_withdrawal: u64,
    dst_cancellation: u64,
): Timelocks {
    Timelocks {
        deployed_at,
        src_withdrawal,
        src_public_withdrawal,
        src_cancellation,
        src_public_cancellation,
        dst_withdrawal,
        dst_public_withdrawal,
        dst_cancellation,
    }
}

public fun set_deployed_at(self: &mut Timelocks, deployed_at: u64) {
    self.deployed_at = deployed_at;
}

public fun set_src_withdrawal(self: &mut Timelocks, src_withdrawal: u64) {
    self.src_withdrawal = src_withdrawal;
}

public fun set_src_public_withdrawal(self: &mut Timelocks, src_public_withdrawal: u64) {
    self.src_public_withdrawal = src_public_withdrawal;
}

public fun set_src_cancellation(self: &mut Timelocks, src_cancellation: u64) {
    self.src_cancellation = src_cancellation;
}

public fun set_src_public_cancellation(self: &mut Timelocks, src_public_cancellation: u64) {
    self.src_public_cancellation = src_public_cancellation;
}

public fun set_dst_withdrawal(self: &mut Timelocks, dst_withdrawal: u64) {
    self.dst_withdrawal = dst_withdrawal;
}

public fun set_dst_public_withdrawal(self: &mut Timelocks, dst_public_withdrawal: u64) {
    self.dst_public_withdrawal = dst_public_withdrawal;
}

public fun set_dst_cancellation(self: &mut Timelocks, dst_cancellation: u64) {
    self.dst_cancellation = dst_cancellation;
}

public fun dst_withdrawal(self: &Timelocks): u64 {
    self.dst_withdrawal
}

public fun dst_public_withdrawal(self: &Timelocks): u64 {
    self.dst_public_withdrawal
}

public fun dst_cancellation(self: &Timelocks): u64 {
    self.dst_cancellation
}

public fun src_withdrawal(self: &Timelocks): u64 {
    self.src_withdrawal
}

public fun src_public_withdrawal(self: &Timelocks): u64 {
    self.src_public_withdrawal
}

public fun src_cancellation(self: &Timelocks): u64 {
    self.src_cancellation
}

public fun src_public_cancellation(self: &Timelocks): u64 {
    self.src_public_cancellation
}

public fun deployed_at(self: &Timelocks): u64 {
    self.deployed_at
}
