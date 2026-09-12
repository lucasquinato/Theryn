/**
 * File: HoverSystem.ts
 * Path: src/game/systems/
 */

import type { Camera } from "e@camera/Camera.js";
import type { ECSManager } from "e@ecs/ECSManager.js";
import type { Entity } from "e@ecs/Entity.js";
import { System } from "e@ecs/System.js";
import type { MouseInput } from "e@input/mouse/MouseInput.js";
import { GridPosition } from "g@components/GridPosition.js";
import { Tile } from "g@components/Tile.js";
import type { HoverState } from "g@interaction/HoverState.js";
import type { IsometricProjection } from "g@render/IsometricProjection.js";
import type { TileRegistry } from "g@tiles/TileRegistry.js";

/**
 * Resolves the interactive map tile currently located under the mouse pointer.
 *
 * Mouse coordinates are converted from logical screen-space into world-space
 * through the camera and then into logical grid coordinates through the
 * isometric projection.
 *
 * A grid cell is eligible for interaction only when it contains exactly one
 * entity, that entity is a layer-zero tile, and the tile gameplay definition
 * marks it as walkable.
 *
 * Tiles outside layer zero are never interactive regardless of their gameplay
 * definition. Occupied cells are also excluded even when their layer-zero tile
 * would otherwise be walkable.
 *
 * The browser cursor reflects logical interaction immediately and is
 * independent from visual hover animations.
 */
export class HoverSystem extends System {
	/**
	 * Shared ECS runtime containing map and gameplay entities.
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
	 * Tile gameplay registry used to determine whether a tile is walkable.
	 */
	private readonly tiles: TileRegistry;

	/**
	 * Shared state containing the current and previous tile hover states.
	 */
	private readonly hover: HoverState;

	/**
	 * Creates the tile hover system.
	 *
	 * @param ecs - Shared ECS runtime.
	 * @param mouse - Mouse input source.
	 * @param camera - Shared world camera.
	 * @param projection - Shared isometric grid projection.
	 * @param tiles - Tile gameplay definition registry.
	 * @param hover - Shared tile hover state.
	 */
	public constructor(
		ecs: ECSManager,
		mouse: MouseInput,
		camera: Camera,
		projection: IsometricProjection,
		tiles: TileRegistry,
		hover: HoverState,
	) {
		super("update", "required");

		this.ecs = ecs;
		this.mouse = mouse;
		this.camera = camera;
		this.projection = projection;
		this.tiles = tiles;
		this.hover = hover;
	}

	/**
	 * Resolves the currently hovered interactive layer-zero tile.
	 *
	 * Logical hover state changes immediately. Visual transition values are
	 * preserved by HoverState and updated independently by HoverEffectSystem.
	 */
	public override update(): void {
		if (!this.mouse.inside) {
			this.clearHover();
			return;
		}

		const world = this.camera.screenToWorld(this.mouse.x, this.mouse.y);

		const grid = this.projection.toGrid(world.x, world.y);

		const entity = this.resolveInteractiveEntity(grid.row, grid.column);

		if (entity === null) {
			this.clearHover();
			return;
		}

		this.hover.set(entity, grid.row, grid.column);

		this.updateCursor(true);
	}

	/**
	 * Removes the current logical hover and restores the default cursor.
	 *
	 * HoverState preserves the previous tile when necessary so visual exit
	 * effects may continue after logical interaction has ended.
	 */
	private clearHover(): void {
		this.hover.clear();
		this.updateCursor(false);
	}

	/**
	 * Resolves the interactive tile entity occupying a grid cell.
	 *
	 * Interaction requires exactly one entity at the target position. The
	 * entity must also contain a Tile component, belong to layer zero, and be
	 * registered as walkable.
	 *
	 * Any additional entity sharing the same GridPosition makes the cell
	 * non-interactive, regardless of that entity's component composition.
	 *
	 * @param row - Target logical grid row.
	 * @param column - Target logical grid column.
	 *
	 * @returns The interactive tile entity, or `null` when the cell is not
	 * eligible for interaction.
	 */
	private resolveInteractiveEntity(row: number, column: number): Entity | null {
		const entities = this.ecs.query(GridPosition);

		let candidate: Entity | null = null;

		let occupancy = 0;

		for (const entity of entities) {
			const position = this.ecs.getComponent(entity, GridPosition)!;
			if (position.row !== row || position.column !== column) {
				continue;
			}

			occupancy++;

			if (occupancy > 1) {
				return null;
			}

			candidate = entity;
		}

		if (candidate === null || !this.ecs.hasComponent(candidate, Tile)) {
			return null;
		}

		const tile = this.ecs.getComponent(candidate, Tile)!;
		if (tile.layer !== 0) {
			return null;
		}

		const definition = this.tiles.get(tile.id)!;
		if (!definition.walkable) {
			return null;
		}

		return candidate;
	}

	/**
	 * Updates the browser cursor according to tile interactivity.
	 *
	 * Cursor state follows logical hover immediately and does not wait for
	 * visual fade or lift animations to complete.
	 *
	 * @param interactive - Whether an interactive tile is currently hovered.
	 */
	private updateCursor(interactive: boolean): void {
		document.body.style.cursor = interactive ? "pointer" : "default";
	}
}
