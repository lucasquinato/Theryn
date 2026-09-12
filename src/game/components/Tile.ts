/**
 * File: Tile.ts
 * Path: src/game/components/
 */

/**
 * Represents a tile placed within a map.
 *
 * The tile identifier references a globally registered tile resource that can
 * be resolved by the loader. The layer preserves the original map layer from
 * which this tile entity was created.
 *
 * Both values describe the tile's map placement and remain immutable for the
 * lifetime of the component.
 */
export class Tile {
	/**
	 * Global tile identifier used to resolve the corresponding texture region.
	 */
	public readonly id: number;

	/**
	 * Zero-based map layer containing this tile.
	 *
	 * The layer is preserved independently from GridPosition so logical grid
	 * coordinates remain concerned only with row and column placement.
	 */
	public readonly layer: number;

	/**
	 * Creates a tile component.
	 *
	 * @param id - Global tile identifier.
	 * @param layer - Zero-based map layer containing the tile.
	 */
	public constructor(id: number, layer: number) {
		this.id = id;
		this.layer = layer;
	}
}
