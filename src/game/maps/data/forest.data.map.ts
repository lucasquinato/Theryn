/**
 * File: forest.data.map.ts
 * Path: src/game/maps/data/
 */

import type { MapDefinition } from "g@maps/MapDefinition.js";

/**
 * Defines the tile layout used by the forest scene.
 *
 * The map is organized into numeric layers containing rows and columns of
 * global tile identifiers. A value of zero represents an empty cell and does
 * not produce a tile entity when the map is instantiated.
 *
 * The definition remains immutable and is validated against MapDefinition at
 * compile time.
 */
export const forestMap = {
	0: [
		[1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1],
		[1, 1, 104, 102, 1],
		[1, 1, 103, 314, 1],
		[1, 1, 1, 1, 1],
	],
} as const satisfies MapDefinition;
