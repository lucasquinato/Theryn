/**
 * File: Camera.ts
 * Path: src/engine/camera/
 */

/**
 * Represents a two-dimensional coordinate.
 */
export interface CameraPosition {
	/**
	 * Horizontal coordinate.
	 */
	readonly x: number;

	/**
	 * Vertical coordinate.
	 */
	readonly y: number;
}

/**
 * Controls the transformation between world-space and screen-space
 * coordinates.
 *
 * The camera stores a world-space position representing the center of the
 * viewport, along with the logical viewport dimensions and zoom level used
 * during coordinate conversion.
 */
export class Camera {
	/**
	 * Horizontal world-space position at the center of the viewport.
	 */
	private positionX = 0;

	/**
	 * Vertical world-space position at the center of the viewport.
	 */
	private positionY = 0;

	/**
	 * Current camera zoom multiplier.
	 */
	private zoom = 1;

	/**
	 * Logical viewport width used for coordinate transformations.
	 */
	private viewportWidth = 1;

	/**
	 * Logical viewport height used for coordinate transformations.
	 */
	private viewportHeight = 1;

	/**
	 * Current horizontal world-space camera position.
	 */
	public get x(): number {
		return this.positionX;
	}

	/**
	 * Current vertical world-space camera position.
	 */
	public get y(): number {
		return this.positionY;
	}

	/**
	 * Current camera zoom multiplier.
	 */
	public get scale(): number {
		return this.zoom;
	}

	/**
	 * Moves the camera center to a world-space position.
	 *
	 * @param x - Horizontal world-space coordinate.
	 * @param y - Vertical world-space coordinate.
	 */
	public setPosition(x: number, y: number): void {
		this.positionX = x;
		this.positionY = y;
	}

	/**
	 * Changes the camera zoom multiplier.
	 *
	 * @param zoom - Positive zoom multiplier.
	 *
	 * @throws {RangeError} If the zoom is not greater than zero.
	 */
	public setZoom(zoom: number): void {
		if (zoom <= 0) {
			throw new RangeError(`Camera zoom must be greater than zero. Received: ${zoom}.`);
		}

		this.zoom = zoom;
	}

	/**
	 * Updates the logical viewport dimensions used by camera transformations.
	 *
	 * @param width - Logical viewport width.
	 * @param height - Logical viewport height.
	 *
	 * @throws {RangeError} If either viewport dimension is not greater than
	 * zero.
	 */
	public setViewport(width: number, height: number): void {
		if (width <= 0 || height <= 0) {
			throw new RangeError(
				`Camera viewport dimensions must be greater than zero. Received: ${width}x${height}.`,
			);
		}

		this.viewportWidth = width;
		this.viewportHeight = height;
	}

	/**
	 * Converts world-space coordinates into logical screen-space coordinates.
	 *
	 * The camera position represents the world-space point displayed at the
	 * center of the viewport. Zoom is applied relative to that center.
	 *
	 * @param x - Horizontal world-space coordinate.
	 * @param y - Vertical world-space coordinate.
	 *
	 * @returns The corresponding logical screen-space position.
	 */
	public worldToScreen(x: number, y: number): CameraPosition {
		return {
			x: (x - this.positionX) * this.zoom + this.viewportWidth / 2,
			y: (y - this.positionY) * this.zoom + this.viewportHeight / 2,
		};
	}

	/**
	 * Converts logical screen-space coordinates into world-space coordinates.
	 *
	 * This operation is the mathematical inverse of `worldToScreen()`.
	 * Screen coordinates are first translated relative to the viewport center,
	 * then corrected for camera zoom and finally offset by the camera's
	 * world-space position.
	 *
	 * @param x - Horizontal logical screen-space coordinate.
	 * @param y - Vertical logical screen-space coordinate.
	 *
	 * @returns The corresponding world-space position.
	 */
	public screenToWorld(x: number, y: number): CameraPosition {
		return {
			x: (x - this.viewportWidth / 2) / this.zoom + this.positionX,
			y: (y - this.viewportHeight / 2) / this.zoom + this.positionY,
		};
	}
}
