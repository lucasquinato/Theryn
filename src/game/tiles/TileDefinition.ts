/**
 * File: TileDefinition.ts
 * Path: src/game/tiles/
 */

/**
 * Defines the gameplay properties associated with a tile type.
 *
 * Tile definitions describe semantic behavior shared by every tile instance
 * using the same tile ID. They are intentionally independent from rendering
 * and map placement.
 */
export interface TileDefinition {
	/**
	 * Determines whether entities are allowed to move through this tile.
	 */
	readonly walkable: boolean;
}
