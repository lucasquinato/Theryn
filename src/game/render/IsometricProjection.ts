/**
 * File: IsometricProjection.ts
 * Path: src/game/render/
 */

/**
 * Represents a projected point in world space.
 */
export interface IsometricWorldPosition {
	/**
	 * Horizontal world-space coordinate.
	 */
	readonly x: number;

	/**
	 * Vertical world-space coordinate.
	 */
	readonly y: number;
}

/**
 * Converts logical grid coordinates into isometric world-space coordinates.
 *
 * The projection is independent from the camera, canvas, ECS runtime, texture
 * dimensions, and rendering order. It only defines how a grid position maps
 * into the game's isometric world coordinate system.
 */
export class IsometricProjection {
	/**
	 * Width of one logical isometric grid cell in world-space pixels.
	 */
	private readonly tileWidth: number;

	/**
	 * Height of one logical isometric grid cell in world-space pixels.
	 */
	private readonly tileHeight: number;

	/**
	 * Creates an isometric projection using the supplied logical tile size.
	 *
	 * @param tileWidth - Width of one isometric grid cell in world-space pixels.
	 * @param tileHeight - Height of one isometric grid cell in world-space pixels.
	 *
	 * @throws {RangeError} If either tile dimension is not greater than zero.
	 */
	public constructor(tileWidth: number, tileHeight: number) {
		if (tileWidth <= 0) {
			throw new RangeError("Isometric tile width must be greater than zero.");
		}

		if (tileHeight <= 0) {
			throw new RangeError("Isometric tile height must be greater than zero.");
		}

		this.tileWidth = tileWidth;
		this.tileHeight = tileHeight;
	}

	/**
	 * Converts a logical grid position into the world-space origin used by the
	 * isometric cell.
	 *
	 * The returned point represents the horizontal start of the projected tile
	 * and its vertical center line before any visual offset or camera
	 * transformation is applied.
	 *
	 * @param row - Logical grid row.
	 * @param column - Logical grid column.
	 *
	 * @returns Projected world-space origin for the grid position.
	 */
	public toWorld(row: number, column: number): IsometricWorldPosition {
		return {
			x: (column - row) * (this.tileWidth / 2),

			y: (column + row) * (this.tileHeight / 2),
		};
	}

	/**
	 * Converts a logical grid position into the world-space center anchor of
	 * the corresponding isometric cell.
	 *
	 * This anchor is suitable for entities such as characters whose visual
	 * origin should be aligned to the center of the grid cell rather than the
	 * horizontal start of the tile texture.
	 *
	 * @param row - Logical grid row.
	 * @param column - Logical grid column.
	 *
	 * @returns World-space center anchor for the grid position.
	 */
	public toWorldCenter(row: number, column: number): IsometricWorldPosition {
		const position = this.toWorld(row, column);

		return {
			x: position.x + this.tileWidth / 2,

			y: position.y,
		};
	}

	/**
	 * Calculates the vertical world-space offset associated with a map layer.
	 *
	 * Layer offsets affect only visual placement. They do not participate in
	 * logical grid position or render ordering.
	 *
	 * @param layer - Zero-based map layer.
	 *
	 * @returns Vertical world-space offset for the supplied layer.
	 */
	public getLayerOffsetY(layer: number): number {
		return (layer + 1) * (this.tileHeight / 2);
	}
}
