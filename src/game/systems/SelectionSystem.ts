/**
 * File: SelectionSystem.ts
 * Path: src/game/systems/
 */

import { System } from "e@ecs/System.js";

import { GridPosition } from "g@components/GridPosition.js";
import { Movement } from "g@components/Movement.js";
import { Player } from "g@components/Player.js";

import type { ECSManager } from "e@ecs/ECSManager.js";
import type { MouseInput } from "e@input/mouse/MouseInput.js";

import type { HoverState } from "g@interaction/HoverState.js";
import type { SelectionState } from "g@interaction/SelectionState.js";
import type { GridPathfinder } from "g@navigation/GridPathfinder.js";

/**
 * Handles interactive tile selection and starts player movement toward the
 * selected destination.
 *
 * A selection can only be created while the player is idle and an interactive
 * tile is currently hovered. The selected tile is converted into a navigation
 * path through GridPathfinder.
 *
 * If no valid path exists, the selection is immediately discarded and
 * movement does not begin.
 */
export class SelectionSystem extends System {
	/**
	 * Shared ECS runtime containing the player entity and movement components.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Mouse input used to detect tile selection clicks.
	 */
	private readonly mouse: MouseInput;

	/**
	 * Shared hover state containing the currently interactive tile.
	 */
	private readonly hover: HoverState;

	/**
	 * Shared selection state containing the current navigation destination.
	 */
	private readonly selection: SelectionState;

	/**
	 * Pathfinder used to resolve a navigable route to the selected tile.
	 */
	private readonly pathfinder: GridPathfinder;

	/**
	 * Creates the tile selection system.
	 *
	 * @param ecs - Shared ECS runtime.
	 * @param mouse - Mouse input source.
	 * @param hover - Shared interactive hover state.
	 * @param selection - Shared destination selection state.
	 * @param pathfinder - Grid pathfinder used to resolve movement routes.
	 */
	public constructor(
		ecs: ECSManager,
		mouse: MouseInput,
		hover: HoverState,
		selection: SelectionState,
		pathfinder: GridPathfinder,
	) {
		super("update", "required");

		this.ecs = ecs;
		this.mouse = mouse;
		this.hover = hover;
		this.selection = selection;
		this.pathfinder = pathfinder;
	}

	/**
	 * Processes left mouse clicks while the player is idle.
	 */
	public override update(): void {
		if (!this.mouse.wasClicked(0)) {
			return;
		}

		if (
			!this.hover.active ||
			this.hover.entity === null ||
			this.hover.row === null ||
			this.hover.column === null
		) {
			return;
		}

		const player = this.getPlayer();
		if (player === null) {
			return;
		}

		const movement = this.ecs.getComponent(player, Movement)!;
		if (movement.active) {
			return;
		}

		const position = this.ecs.getComponent(player, GridPosition)!;

		const path = this.pathfinder.findPath(
			position.row,
			position.column,
			this.hover.row,
			this.hover.column,
			player,
		);

		if (path.length === 0) {
			this.selection.clear();
			return;
		}

		this.selection.set(this.hover.entity, this.hover.row, this.hover.column);

		movement.start(path, position.row, position.column);

		/**
		 * Interaction is disabled while movement is active, so the current
		 * hover is cleared as soon as navigation begins.
		 */
		this.hover.clear();

		document.body.style.cursor = "default";
	}

	/**
	 * Resolves the player entity controlled by tile selection.
	 *
	 * The current game runtime expects a single Player entity.
	 *
	 * @returns The player entity, or `null` when none exists.
	 */
	private getPlayer(): number | null {
		const players = this.ecs.query(Player, GridPosition, Movement);

		return players[0] ?? null;
	}
}
