/**
 * File: SelectionSystem.ts
 * Path: src/game/systems/
 */

import type { ECSManager } from "e@ecs/ECSManager.js";
import { System } from "e@ecs/System.js";
import type { MouseInput } from "e@input/mouse/MouseInput.js";
import { GridPosition } from "g@components/GridPosition.js";
import { Movement } from "g@components/Movement.js";
import { Player } from "g@components/Player.js";
import type { HoverState } from "g@interaction/HoverState.js";
import type { SelectionState } from "g@interaction/SelectionState.js";
import type { GridPathfinder } from "g@navigation/GridPathfinder.js";
import type { MovementRangeState } from "g@navigation/MovementRangeState.js";

/**
 * Handles interactive tile selection and starts player movement toward the
 * selected destination.
 *
 * A destination can only be selected while the player is idle, the tile is
 * currently interactive, and the destination belongs to the player's active
 * movement range.
 *
 * The movement range acts as the authoritative cost-budget constraint while
 * GridPathfinder resolves the concrete minimum-cost route used for traversal.
 */
export class SelectionSystem extends System {
	/**
	 * Shared ECS runtime containing the player entity.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Mouse input used to detect destination selection clicks.
	 */
	private readonly mouse: MouseInput;

	/**
	 * Shared hover state containing the currently interactive tile.
	 */
	private readonly hover: HoverState;

	/**
	 * Shared destination selection state.
	 */
	private readonly selection: SelectionState;

	/**
	 * Shared movement range containing destinations reachable within the
	 * configured movement cost budget.
	 */
	private readonly range: MovementRangeState;

	/**
	 * Pathfinder used to resolve the concrete minimum-cost route to the
	 * selected tile.
	 */
	private readonly pathfinder: GridPathfinder;

	/**
	 * Creates the tile selection system.
	 *
	 * @param ecs - Shared ECS runtime.
	 * @param mouse - Mouse input source.
	 * @param hover - Shared interactive hover state.
	 * @param selection - Shared destination selection state.
	 * @param range - Shared reachable movement range.
	 * @param pathfinder - Grid pathfinder used to resolve movement routes.
	 */
	public constructor(
		ecs: ECSManager,
		mouse: MouseInput,
		hover: HoverState,
		selection: SelectionState,
		range: MovementRangeState,
		pathfinder: GridPathfinder,
	) {
		super("update", "required");

		this.ecs = ecs;
		this.mouse = mouse;
		this.hover = hover;
		this.selection = selection;
		this.range = range;
		this.pathfinder = pathfinder;
	}

	/**
	 * Processes left mouse clicks while the player is idle.
	 *
	 * The clicked destination must belong to the current movement range and
	 * the concrete path resolved by GridPathfinder must not exceed the minimum
	 * movement cost previously calculated for that destination.
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

		const movement = this.ecs.getComponent(player, Movement);

		if (movement === undefined || movement.active) {
			return;
		}

		const allowedCost = this.range.getCost(this.hover.row, this.hover.column);

		console.log("Selection cost:", {
			row: this.hover.row,
			column: this.hover.column,
			allowedCost,
		});

		if (allowedCost === null) {
			return;
		}

		const position = this.ecs.getComponent(player, GridPosition);

		if (position === undefined) {
			return;
		}

		const path = this.pathfinder.findPath(
			position.row,
			position.column,
			this.hover.row,
			this.hover.column,
			player,
		);

		console.log("Path result:", {
			cost: path?.cost ?? null,
			nodes: path?.nodes ?? [],
		});

		if (path === null || path.nodes.length === 0) {
			this.selection.clear();
			return;
		}

		/**
		 * The movement range and pathfinder use the same navigation rules.
		 * Therefore the resolved path should never exceed the minimum cost
		 * calculated for the destination. This guard prevents movement when
		 * those two navigation results become inconsistent.
		 */
		if (path.cost > allowedCost) {
			this.selection.clear();
			return;
		}

		this.selection.set(this.hover.entity, this.hover.row, this.hover.column);

		movement.start(path.nodes, position.row, position.column);

		/**
		 * Hover and movement-range interaction are unavailable while the player
		 * traverses the selected path.
		 */
		this.hover.clear();
		this.range.clear();

		document.body.style.cursor = "default";
	}

	/**
	 * Resolves the player entity controlled by tile selection.
	 *
	 * The current runtime expects a single Player entity.
	 *
	 * @returns The player entity, or `null` when none exists.
	 */
	private getPlayer(): number | null {
		const players = this.ecs.query(Player, GridPosition, Movement);

		return players[0] ?? null;
	}
}
