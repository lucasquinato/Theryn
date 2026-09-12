/**
 * File: IsometricProjection.ts
 * Path: src/game/render/
 */

/**
 * Represents a two-dimensional world-space position produced by the
 * isometric projection.
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
 * Represents a logical cell in the isometric grid.
 */
export interface IsometricGridPosition {
	/**
	 * Grid row.
	 */
	readonly row: number;

	/**
	 * Grid column.
	 */
	readonly column: number;
}

/**
 * Converts between logical grid coordinates and isometric world-space
 * coordinates.
 *
 * The projection is independent from camera positioning, zoom, rendering,
 * ECS state, and map contents. It describes only the geometric relationship
 * between the logical grid and the isometric world.
 */
export class IsometricProjection {
	/**
	 * Visual width of a single isometric tile footprint.
	 */
	private readonly tileWidth: number;

	/**
	 * Visual height of a single isometric tile footprint.
	 */
	private readonly tileHeight: number;

	/**
	 * Creates an isometric projection.
	 *
	 * @param tileWidth - Width of a tile footprint in world-space units.
	 * @param tileHeight - Height of a tile footprint in world-space units.
	 *
	 * @throws {RangeError} If either tile dimension is not greater than zero.
	 */
	public constructor(tileWidth: number, tileHeight: number) {
		if (tileWidth <= 0 || tileHeight <= 0) {
			throw new RangeError(
				`Isometric tile dimensions must be greater than zero. Received: ${tileWidth}x${tileHeight}.`,
			);
		}

		this.tileWidth = tileWidth;
		this.tileHeight = tileHeight;
	}

	/**
	 * Converts a logical grid position into the world-space position of the
	 * tile bounding box.
	 *
	 * @param row - Grid row.
	 * @param column - Grid column.
	 *
	 * @returns The projected world-space position.
	 */
	public toWorld(row: number, column: number): IsometricWorldPosition {
		return {
			x: (column - row) * (this.tileWidth / 2),
			y: (column + row) * (this.tileHeight / 2),
		};
	}

	/**
	 * Converts a logical grid position into its horizontal tile center and
	 * upper isometric anchor.
	 *
	 * This anchor is used by entities that visually stand on a grid cell,
	 * such as characters and camera-follow targets.
	 *
	 * @param row - Grid row.
	 * @param column - Grid column.
	 *
	 * @returns The projected world-space anchor.
	 */
	public toWorldCenter(row: number, column: number): IsometricWorldPosition {
		const position = this.toWorld(row, column);

		return {
			x: position.x + this.tileWidth / 2,
			y: position.y,
		};
	}

	/**
	 * Converts a world-space point into the logical grid cell whose diamond
	 * footprint contains that point.
	 *
	 * The conversion first shifts the world point relative to tile centers,
	 * then applies the mathematical inverse of the isometric projection.
	 * Fractional grid coordinates are rounded to the nearest integer cell so
	 * the full diamond footprint resolves to the same row and column.
	 *
	 * This method performs only geometric conversion. It does not verify
	 * whether the resulting grid position exists in the current map.
	 *
	 * @param x - Horizontal world-space coordinate.
	 * @param y - Vertical world-space coordinate.
	 *
	 * @returns The logical grid cell containing the world-space point.
	 */
	public toGrid(x: number, y: number): IsometricGridPosition {
		const centeredX = x - this.tileWidth / 2;
		const centeredY = y - this.tileHeight / 2;

		const horizontal = centeredX / (this.tileWidth / 2);
		const vertical = centeredY / (this.tileHeight / 2);

		const column = (horizontal + vertical) / 2;
		const row = (vertical - horizontal) / 2;

		return {
			row: Math.round(row),
			column: Math.round(column),
		};
	}

	/**
	 * Calculates the vertical world-space offset applied to a map layer.
	 *
	 * Layer displacement affects only visual placement and does not change the
	 * logical grid position used for ordering or gameplay.
	 *
	 * @param layer - Map layer index.
	 *
	 * @returns Vertical world-space displacement for the layer.
	 */
	public getLayerOffsetY(layer: number): number {
		return (layer + 1) * (this.tileHeight / 2);
	}

	/**
	 * Visual width of a single isometric tile footprint.
	 */
	public get width(): number {
		return this.tileWidth;
	}

	/**
	 * Visual height of a single isometric tile footprint.
	 */
	public get height(): number {
		return this.tileHeight;
	}
}
