/**
 * File: WorldPosition.ts
 * Path: src/game/components/
 */

/**
 * Stores a continuous world-space position for an entity.
 *
 * WorldPosition is intended for smooth visual movement and camera tracking.
 * It is independent from GridPosition, which remains responsible for logical
 * grid occupancy, navigation, and render ordering.
 */
export class WorldPosition {
	/**
	 * Horizontal world-space coordinate.
	 */
	public x: number;

	/**
	 * Vertical world-space coordinate.
	 */
	public y: number;

	/**
	 * Creates a world-space position.
	 *
	 * @param x - Initial horizontal world-space coordinate.
	 * @param y - Initial vertical world-space coordinate.
	 */
	public constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	/**
	 * Updates both world-space coordinates.
	 *
	 * @param x - New horizontal world-space coordinate.
	 * @param y - New vertical world-space coordinate.
	 */
	public set(x: number, y: number): void {
		this.x = x;
		this.y = y;
	}
}
