/**
 * File: CameraFollowSystem.ts
 * Path: src/game/systems/
 */

import type { Camera } from "e@camera/Camera.js";
import type { ECSManager } from "e@ecs/ECSManager.js";
import { System } from "e@ecs/System.js";
import { Player } from "g@components/Player.js";
import { WorldPosition } from "g@components/WorldPosition.js";

/**
 * Keeps the shared camera centered on the player entity.
 *
 * Camera tracking uses the player's continuous WorldPosition rather than its
 * discrete GridPosition. This allows the camera to follow smooth character
 * movement without jumping between logical grid cells.
 *
 * The current game runtime expects a single Player entity. When no player with
 * a WorldPosition exists, the camera remains unchanged.
 */
export class CameraFollowSystem extends System {
	/**
	 * Shared ECS runtime containing the player entity.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Camera that follows the player's visual world-space position.
	 */
	private readonly camera: Camera;

	/**
	 * Creates the required camera follow system.
	 *
	 * @param ecs - Shared ECS runtime containing the player.
	 * @param camera - Shared camera to position.
	 */
	public constructor(ecs: ECSManager, camera: Camera) {
		super("update", "required");

		this.ecs = ecs;
		this.camera = camera;
	}

	/**
	 * Centers the camera on the player's continuous world-space position.
	 */
	public override update(): void {
		const players = this.ecs.query(Player, WorldPosition);
		const player = players[0];
		if (player === undefined) {
			return;
		}

		const worldPosition = this.ecs.getComponent(player, WorldPosition)!;
		this.camera.setPosition(worldPosition.x, worldPosition.y);
	}
}
