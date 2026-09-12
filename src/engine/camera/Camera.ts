/**
 * File: Camera.ts
 * Path: src/engine/camera/
 */

/**
 * Represents a two-dimensional camera used to transform world coordinates
 * into screen coordinates.
 *
 * The camera position represents the world-space point that should appear at
 * the center of the viewport.
 *
 * The camera is intentionally independent from maps, grids, isometric
 * projection, canvases, and ECS entities. Rendering systems are responsible
 * for providing world-space coordinates and the current viewport dimensions.
 */
export class Camera {
	/**
	 * Horizontal world-space position currently centered by the camera.
	 */
	private positionX = 0;

	/**
	 * Vertical world-space position currently centered by the camera.
	 */
	private positionY = 0;

	/**
	 * Current camera zoom multiplier.
	 */
	private zoom = 1;

	/**
	 * Width of the current viewport in logical pixels.
	 */
	private viewportWidth = 0;

	/**
	 * Height of the current viewport in logical pixels.
	 */
	private viewportHeight = 0;

	/**
	 * Returns the horizontal world-space position centered by the camera.
	 */
	public get x(): number {
		return this.positionX;
	}

	/**
	 * Returns the vertical world-space position centered by the camera.
	 */
	public get y(): number {
		return this.positionY;
	}

	/**
	 * Returns the current camera zoom multiplier.
	 */
	public get scale(): number {
		return this.zoom;
	}

	/**
	 * Sets the world-space point that should appear at the center of the
	 * viewport.
	 *
	 * @param x - Horizontal world-space camera position.
	 * @param y - Vertical world-space camera position.
	 */
	public setPosition(x: number, y: number): void {
		this.positionX = x;
		this.positionY = y;
	}

	/**
	 * Sets the camera zoom multiplier.
	 *
	 * @param zoom - Positive zoom multiplier.
	 *
	 * @throws {RangeError} If the provided zoom is not greater than zero.
	 */
	public setZoom(zoom: number): void {
		if (zoom <= 0) {
			throw new RangeError("Camera zoom must be greater than zero.");
		}

		this.zoom = zoom;
	}

	/**
	 * Updates the logical viewport dimensions used by camera transformations.
	 *
	 * @param width - Viewport width in logical pixels.
	 * @param height - Viewport height in logical pixels.
	 *
	 * @throws {RangeError} If either dimension is not greater than zero.
	 */
	public setViewport(width: number, height: number): void {
		if (width <= 0 || height <= 0) {
			throw new RangeError("Camera viewport dimensions must be greater than zero.");
		}

		this.viewportWidth = width;
		this.viewportHeight = height;
	}

	/**
	 * Converts a world-space coordinate into screen-space coordinates.
	 *
	 * The camera position is treated as the center of the viewport. World
	 * coordinates are translated relative to that position, scaled by the
	 * current zoom, and then offset to the viewport center.
	 *
	 * @param x - Horizontal world-space coordinate.
	 * @param y - Vertical world-space coordinate.
	 *
	 * @returns The corresponding screen-space coordinate.
	 *
	 * @throws {Error} If the camera viewport has not been configured.
	 */
	public worldToScreen(x: number, y: number): { readonly x: number; readonly y: number } {
		if (this.viewportWidth <= 0 || this.viewportHeight <= 0) {
			throw new Error("Camera viewport must be configured before transforming coordinates.");
		}

		return {
			x: (x - this.positionX) * this.zoom + this.viewportWidth / 2,

			y: (y - this.positionY) * this.zoom + this.viewportHeight / 2,
		};
	}
}
