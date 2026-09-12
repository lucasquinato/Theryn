/**
 * File: lobby.data.map.ts
 * Path: src/game/maps/data/
 */

import type { MapDefinition } from "g@maps/MapDefinition.js";

/**
 * Defines the tile layout used by the lobby scene.
 *
 * The map is organized into numeric layers containing rows and columns of
 * global tile identifiers. A value of zero represents an empty cell and does
 * not produce a tile entity when the map is instantiated.
 *
 * This map intentionally contains a broad selection of registered tile
 * identifiers so their texture definitions and map rendering behavior can be
 * validated during development.
 *
 * Multiple layers may contain tiles at the same grid position. Each non-empty
 * cell is instantiated as an independent entity while preserving its original
 * layer through the Tile component.
 *
 * The definition remains immutable and is validated against MapDefinition at
 * compile time.
 */
export const lobbyMap = {
	0: [
		[1, 1, 1, 1, 1, 1, 0, 301, 0, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 0, 301, 301, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
		[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
		[1, 1, 1, 1, 1, 1, 104, 102, 1, 1, 1, 0],
		[0, 0, 0, 1, 1, 104, 101, 101, 1, 1, 1, 0],
		[301, 301, 0, 1, 1, 103, 101, 105, 1, 1, 1, 0],
		[0, 301, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
		[0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
		[0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	],
	1: [
		[1, 1, 1, 1, 1, 1, 201, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 201, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 201, 201, 201, 201, 0, 0],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 201, 201, 0],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 201, 201],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 201],
		[201, 201, 201, 0, 0, 0, 0, 0, 0, 0, 0, 201],
		[0, 0, 201, 0, 0, 0, 0, 0, 0, 0, 0, 201],
		[0, 0, 201, 0, 0, 0, 0, 0, 0, 0, 201, 201],
		[0, 0, 201, 201, 0, 0, 0, 0, 0, 0, 201, 0],
		[0, 0, 0, 201, 201, 0, 0, 0, 201, 201, 201, 0],
		[0, 0, 0, 0, 201, 201, 201, 201, 201, 0, 0, 0],
	],
	2: [
		[1, 1, 1, 902, 902, 902, 903, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 903, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[902, 0, 0, 0, 0, 0, 0, 0, 0, 906, 0, 0],
		[902, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[902, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[903, 903, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	],
	3: [
		[902, 902, 902, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[902, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[902, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	],
} as const satisfies MapDefinition;
