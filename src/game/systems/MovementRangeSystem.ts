/**
 * File: MovementRangeSystem.ts
 * Path: src/game/systems/
 */

import type { ECSManager } from "e@ecs/ECSManager.js";
import { System } from "e@ecs/System.js";
import { GridPosition } from "g@components/GridPosition.js";
import { Movement } from "g@components/Movement.js";
import { Player } from "g@components/Player.js";
import type { CharacterMovementConfig } from "g@config/MovementConfig.js";
import type { GridCostField } from "g@navigation/GridCostField.js";
import type { MovementRangeState } from "g@navigation/MovementRangeState.js";

/**
 * Keeps the player's reachable movement range synchronized with the current
 * logical grid position.
 *
 * While the player is idle, the system calculates every reachable cell within
 * the configured movement cost budget. While movement is active, the range is
 * cleared so selection and movement hints are unavailable until the current
 * traversal finishes.
 */
export class MovementRangeSystem extends System {
	/**
	 * Shared ECS runtime containing the controlled player.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Cost-field calculator used to resolve reachable cells.
	 */
	private readonly costField: GridCostField;

	/**
	 * Shared movement range state consumed by selection and hint systems.
	 */
	private readonly range: MovementRangeState;

	/**
	 * Character movement configuration containing the maximum movement cost.
	 */
	private readonly config: CharacterMovementConfig;

	/**
	 * Creates the movement range system.
	 *
	 * @param ecs - Shared ECS runtime.
	 * @param costField - Grid cost-field calculator.
	 * @param range - Shared movement range state.
	 * @param config - Character movement configuration.
	 */
	public constructor(
		ecs: ECSManager,
		costField: GridCostField,
		range: MovementRangeState,
		config: CharacterMovementConfig,
	) {
		super("update", "required");

		this.ecs = ecs;
		this.costField = costField;
		this.range = range;
		this.config = config;
	}

	/**
	 * Recalculates the player's reachable movement range when necessary.
	 */
	public override update(): void {
		const players = this.ecs.query(Player, GridPosition, Movement);
		const player = players[0];
		if (player === undefined) {
			this.range.clear();
			return;
		}

		const position = this.ecs.getComponent(player, GridPosition)!;
		const movement = this.ecs.getComponent(player, Movement)!;
		if (movement.active) {
			this.range.clear();
			return;
		}

		/**
		 * Avoid recalculating the same cost field every frame while the player
		 * remains idle on the same logical grid cell.
		 */
		if (
			this.range.active &&
			this.range.row === position.row &&
			this.range.column === position.column
		) {
			return;
		}

		const nodes = this.costField.calculate(
			position.row,
			position.column,
			player,
			this.config.maximumCost,
		);

		console.log("Movement range:", nodes);

		this.range.set(position.row, position.column, nodes);
	}
}
