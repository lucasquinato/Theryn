/**
 * File: HoverSystem.ts
 * Path: src/game/systems/
 */

import { System } from "e@ecs/System.js";

import { Movement } from "g@components/Movement.js";
import { Player } from "g@components/Player.js";

import type { Camera } from "e@camera/Camera.js";
import type { ECSManager } from "e@ecs/ECSManager.js";
import type { MouseInput } from "e@input/mouse/MouseInput.js";

import type { HoverState } from "g@interaction/HoverState.js";
import type { GridNavigation } from "g@navigation/GridNavigation.js";
import type { IsometricProjection } from "g@render/IsometricProjection.js";

/**
 * Resolves the interactive map tile currently located under the mouse pointer.
 *
 * Mouse coordinates are converted from logical screen-space into world-space
 * through the camera and then into logical grid coordinates through the
 * isometric projection.
 *
 * Tile eligibility is delegated to GridNavigation so hover, selection, and
 * movement consume the same walkability and occupancy rules.
 *
 * Hover interaction is completely disabled while the player is moving.
 * Logical hover state is cleared immediately while any remaining visual exit
 * animation is allowed to finish through HoverState.
 */
export class HoverSystem extends System {
	/**
	 * Shared ECS runtime containing the player movement state.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Mouse input used to resolve the current pointer position.
	 */
	private readonly mouse: MouseInput;

	/**
	 * Camera used to convert screen-space input into world-space coordinates.
	 */
	private readonly camera: Camera;

	/**
	 * Isometric projection used to convert world-space coordinates into
	 * logical grid coordinates.
	 */
	private readonly projection: IsometricProjection;

	/**
	 * Shared navigation resolver containing grid interaction rules.
	 */
	private readonly navigation: GridNavigation;

	/**
	 * Shared state containing current and previous tile hover visuals.
	 */
	private readonly hover: HoverState;

	/**
	 * Creates the tile hover system.
	 *
	 * @param ecs - Shared ECS runtime.
	 * @param mouse - Mouse input source.
	 * @param camera - Shared world camera.
	 * @param projection - Shared isometric grid projection.
	 * @param navigation - Shared grid navigation resolver.
	 * @param hover - Shared tile hover state.
	 */
	public constructor(
		ecs: ECSManager,
		mouse: MouseInput,
		camera: Camera,
		projection: IsometricProjection,
		navigation: GridNavigation,
		hover: HoverState,
	) {
		super("update", "required");

		this.ecs = ecs;
		this.mouse = mouse;
		this.camera = camera;
		this.projection = projection;
		this.navigation = navigation;
		this.hover = hover;
	}

	/**
	 * Resolves the currently hovered interactive tile.
	 *
	 * Hover is disabled while the player is traversing a movement path.
	 */
	public override update(): void {
		if (this.isPlayerMoving() || !this.mouse.inside) {
			this.clearHover();
			return;
		}

		const world = this.camera.screenToWorld(this.mouse.x, this.mouse.y);
		const grid = this.projection.toGrid(world.x, world.y);

		const entity = this.navigation.getWalkableTile(grid.row, grid.column);
		if (entity === null) {
			this.clearHover();
			return;
		}

		this.hover.set(entity, grid.row, grid.column);

		this.updateCursor(true);
	}

	/**
	 * Determines whether the controlled player is currently moving.
	 *
	 * The current runtime expects a single Player entity. When no player with
	 * a Movement component exists, interaction remains available.
	 *
	 * @returns `true` while the player is traversing an active path.
	 */
	private isPlayerMoving(): boolean {
		const players = this.ecs.query(Player, Movement);

		const player = players[0];
		if (player === undefined) {
			return false;
		}

		const movement = this.ecs.getComponent(player, Movement)!;
		return movement.active;
	}

	/**
	 * Removes the current logical hover and restores the default cursor.
	 *
	 * HoverState preserves the outgoing visual state so fade-out and tile
	 * descent may complete naturally.
	 */
	private clearHover(): void {
		this.hover.clear();
		this.updateCursor(false);
	}

	/**
	 * Updates the browser cursor according to current tile interactivity.
	 *
	 * @param interactive - Whether an interactive tile is currently hovered.
	 */
	private updateCursor(interactive: boolean): void {
		document.body.style.cursor = interactive ? "pointer" : "default";
	}
}
