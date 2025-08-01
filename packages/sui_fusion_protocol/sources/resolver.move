module sui_fusion_protocol::resolver;

use sui::event;

// use sui::object;

// === Structs ===
public struct Resolver has key, store {
    id: UID,
    escrow_factory_id: ID,
}

// === Events ===
public struct ResolverCreated has copy, drop {
    resolver_id: ID,
    escrow_factory_id: ID,
}

public fun deploy_src() {}

public fun create_resolver(escrow_factory_id: ID, ctx: &mut TxContext): Resolver {
    let resolver = Resolver {
        id: object::new(ctx),
        escrow_factory_id: escrow_factory_id,
    };

    event::emit(ResolverCreated {
        resolver_id: object::id(&resolver),
        escrow_factory_id: resolver.escrow_factory_id,
    });

    resolver
}
