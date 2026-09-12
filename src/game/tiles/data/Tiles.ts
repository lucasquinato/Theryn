/**
 * File: Tiles.ts
 * Path: src/game/tiles/data/
 */

import { TileRegistry } from "g@tiles/TileRegistry.js";

/**
 * Global tile gameplay registry for Theryntile.
 *
 * Definitions are declared in registration order. Later registrations
 * intentionally override earlier rules for the same tile ID.
 */
export const Tiles = new TileRegistry()
	.register(1, {
		walkable: true,
	})

	.registerRange(101, 105, {
		walkable: false,
	})
	.registerRange(212, 224, {
		walkable: false,
	})
	.registerRange(301, 315, {
		walkable: false,
	})
	.registerRange(401, 418, {
		walkable: false,
	})
	.registerRange(502, 517, {
		walkable: false,
	})
	.registerRange(901, 920, {
		walkable: false,
	})

	.registerRange(201, 211, {
		walkable: true,
	})
	.register(501, {
		walkable: true,
	});
