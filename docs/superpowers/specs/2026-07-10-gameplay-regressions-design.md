# Gameplay Regressions Design

## Scope

Correct the save migration, market data, stormy-weather patience, and minigame regressions identified during review.

## Behavior

- Version-1 saves that contain `cafe.unlockedDecorations` convert each string entry into the counted `cafe.ownedDecorations` shape. Current ownership values remain intact.
- Every ingredient sold by the market is referenced by at least one recipe.
- Stormy weather keeps its existing 30 percent customer-frequency reduction and gives spawned customers 25 percent more patience.
- Cold-drink assembly expires after eight seconds. Expired games report the existing low accuracy score.
- Latte-art pointer input advances only through checkpoints in path order. Keyboard input remains sequential.
- Milk games always complete after five seconds, including recipes without a dedicated target.

## Validation

Add focused tests for legacy decoration conversion, recipe ingredient coverage, stormy customer patience, the assembly timeout, ordered latte tracing, and milk timer completion.
