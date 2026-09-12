/**
 * File: GridPosition.ts
 * Path: src/game/components/
 */

/**
 * Represents the logical position of an entity within a two-dimensional grid.
 *
 * Grid coordinates describe logical placement only and are independent from
 * screen, world, or projected coordinates. Rendering systems may transform
 * this position into another coordinate space, such as an isometric view.
 *
 * Row and column remain mutable so the same component can represent both
 * static and movable entities.
 */
export class GridPosition {
	/**
	 * Zero-based row currently occupied by the entity.
	 */
	public row: number;

	/**
	 * Zero-based column currently occupied by the entity.
	 */
	public column: number;

	/**
	 * Creates a logical grid position.
	 *
	 * @param row - Zero-based grid row.
	 * @param column - Zero-based grid column.
	 */
	public constructor(row: number, column: number) {
		this.row = row;
		this.column = column;
	}
}
