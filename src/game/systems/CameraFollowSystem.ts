/**
 * File: CameraFollowSystem.ts
 * Path: src/game/systems/
 */

import { System } from "e@ecs/System.js";

import type { Camera } from "e@camera/Camera.js";
import type { ECSManager } from "e@ecs/ECSManager.js";

import { GridPosition } from "g@components/GridPosition.js";
import { Player } from "g@components/Player.js";

import type { IsometricProjection } from "g@render/IsometricProjection.js";

/**
 * Keeps the shared camera centered on the player entity.
 *
 * The system locates the entity containing both Player and GridPosition
 * components, converts its logical grid position into the center anchor of the
 * corresponding isometric cell, and updates the camera position accordingly.
 *
 * Camera following is intentionally based on logical world position rather
 * than sprite dimensions or screen-space coordinates.
 *
 * The current implementation follows the player immediately. Interpolation,
 * dead zones, camera bounds, and other advanced behaviors are intentionally
 * deferred until gameplay requires them.
 */
export class CameraFollowSystem extends System {
	/**
	 * Shared ECS runtime containing the player entity.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Shared camera controlled by this system.
	 */
	private readonly camera: Camera;

	/**
	 * Shared isometric projection used to convert grid coordinates into world
	 * coordinates.
	 */
	private readonly projection: IsometricProjection;

	/**
	 * Creates the required camera follow system.
	 *
	 * @param ecs - Shared ECS runtime containing the player entity.
	 * @param camera - Shared camera to position.
	 * @param projection - Shared isometric projection.
	 */
	public constructor(ecs: ECSManager, camera: Camera, projection: IsometricProjection) {
		super("update", "required");

		this.ecs = ecs;
		this.camera = camera;
		this.projection = projection;
	}

	/**
	 * Centers the camera on the current player grid position.
	 *
	 * If no player entity exists, the camera position remains unchanged.
	 *
	 * If multiple player entities exist, the first matching entity returned by
	 * the ECS query is used. The game is expected to maintain a single Player
	 * marker under normal runtime conditions.
	 */
	public override update(): void {
		const entities = this.ecs.query(Player, GridPosition);
		const entity = entities[0];
		if (entity === undefined) {
			return;
		}

		const position = this.ecs.getComponent(entity, GridPosition);
		if (!position) {
			return;
		}

		const worldPosition = this.projection.toWorldCenter(position.row, position.column);

		this.camera.setPosition(worldPosition.x, worldPosition.y);
	}
}
