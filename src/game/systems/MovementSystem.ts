/**
 * File: MovementSystem.ts
 * Path: src/game/systems/
 */

import { System } from "e@ecs/System.js";

import { Animator } from "g@components/Animator.js";
import { GridPosition } from "g@components/GridPosition.js";
import { WorldPosition } from "g@components/WorldPosition.js";
import { Movement, type MovementDirection } from "g@components/Movement.js";

import type { ECSManager } from "e@ecs/ECSManager.js";

import type { SelectionState } from "g@interaction/SelectionState.js";
import type { GridPathNode } from "g@navigation/GridPathfinder.js";
import type { IsometricProjection } from "g@render/IsometricProjection.js";

import type { CharacterMovementConfig } from "g@config/MovementConfig.js";

/**
 * Executes smooth character movement across logical grid paths.
 *
 * Entities move visually through WorldPosition while GridPosition remains
 * discrete and changes only when the visual anchor crosses the midpoint
 * between two neighboring cells.
 *
 * Character animation always follows the direction of the current path
 * segment rather than the final destination direction.
 */
export class MovementSystem extends System {
	/**
	 * Shared ECS runtime containing movable entities.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Shared isometric projection used to resolve grid anchors in world space.
	 */
	private readonly projection: IsometricProjection;

	/**
	 * Shared destination selection cleared when movement completes.
	 */
	private readonly selection: SelectionState;

	private readonly config: CharacterMovementConfig;

	/**
	 * Creates the movement execution system.
	 *
	 * @param ecs - Shared ECS runtime.
	 * @param projection - Shared isometric grid projection.
	 * @param selection - Shared destination selection state.
	 */
	public constructor(
		ecs: ECSManager,
		projection: IsometricProjection,
		selection: SelectionState,
		config: CharacterMovementConfig,
	) {
		super("update", "required");

		this.ecs = ecs;
		this.projection = projection;
		this.selection = selection;
		this.config = config;
	}

	/**
	 * Advances every active movement component.
	 *
	 * @param deltaTime - Elapsed time since the previous frame in seconds.
	 */
	public override update(deltaTime: number): void {
		const entities = this.ecs.query(GridPosition, WorldPosition, Movement, Animator);

		for (const entity of entities) {
			const movement = this.ecs.getComponent(entity, Movement)!;
			if (!movement.active) {
				continue;
			}

			const gridPosition = this.ecs.getComponent(entity, GridPosition)!;
			const worldPosition = this.ecs.getComponent(entity, WorldPosition)!;
			const animator = this.ecs.getComponent(entity, Animator)!;

			this.updateMovement(gridPosition, worldPosition, movement, animator, deltaTime);
		}
	}

	/**
	 * Advances a single entity through its active movement segment.
	 */
	private updateMovement(
		gridPosition: GridPosition,
		worldPosition: WorldPosition,
		movement: Movement,
		animator: Animator,
		deltaTime: number,
	): void {
		const origin = movement.origin;
		const target = movement.target;
		if (origin === null || target === null) {
			this.finishMovement(movement, animator);

			return;
		}

		const direction = this.resolveDirection(origin, target);

		movement.setDirection(direction);
		animator.play("walk", direction);

		const originWorld = this.projection.toWorldCenter(origin.row, origin.column);
		const targetWorld = this.projection.toWorldCenter(target.row, target.column);

		const segmentDistance = Math.hypot(
			targetWorld.x - originWorld.x,
			targetWorld.y - originWorld.y,
		);

		if (segmentDistance <= 0) {
			this.completeSegment(
				gridPosition,
				worldPosition,
				movement,
				animator,
				target,
				targetWorld.x,
				targetWorld.y,
			);

			return;
		}

		const progressDelta = (this.config.speed * deltaTime) / segmentDistance;
		const nextProgress = Math.min(1, movement.progress + progressDelta);

		worldPosition.set(
			this.lerp(originWorld.x, targetWorld.x, nextProgress),
			this.lerp(originWorld.y, targetWorld.y, nextProgress),
		);

		/**
		 * Grid ownership changes when the character crosses the visual
		 * boundary between the two neighboring tile footprints.
		 */
		if (
			movement.progress < this.config.gridTransitionProgress &&
			nextProgress >= this.config.gridTransitionProgress
		) {
			gridPosition.row = target.row;
			gridPosition.column = target.column;
		}

		movement.setProgress(nextProgress);

		if (nextProgress >= 1) {
			this.completeSegment(
				gridPosition,
				worldPosition,
				movement,
				animator,
				target,
				targetWorld.x,
				targetWorld.y,
			);
		}
	}

	/**
	 * Finalizes the current movement segment.
	 */
	private completeSegment(
		gridPosition: GridPosition,
		worldPosition: WorldPosition,
		movement: Movement,
		animator: Animator,
		target: GridPathNode,
		targetWorldX: number,
		targetWorldY: number,
	): void {
		gridPosition.row = target.row;
		gridPosition.column = target.column;

		worldPosition.set(targetWorldX, targetWorldY);

		const wasFinalSegment = movement.pathIndex === movement.path.length - 1;
		if (wasFinalSegment) {
			this.finishMovement(movement, animator);

			return;
		}

		movement.advance();
	}

	/**
	 * Finishes path traversal and returns the character to idle while
	 * preserving the direction of the final movement segment.
	 */
	private finishMovement(movement: Movement, animator: Animator): void {
		const direction = movement.direction;

		movement.stop();
		animator.play("idle", direction);

		this.selection.clear();
	}

	/**
	 * Resolves animation direction from one neighboring grid cell to another.
	 *
	 * Direction is based exclusively on the next movement step.
	 *
	 * @throws {Error} If the two nodes are not orthogonally adjacent.
	 */
	private resolveDirection(origin: GridPathNode, target: GridPathNode): MovementDirection {
		const rowDelta = target.row - origin.row;
		const columnDelta = target.column - origin.column;

		if (rowDelta === 0 && columnDelta === 1) {
			return "rightDown";
		}

		if (rowDelta === 1 && columnDelta === 0) {
			return "leftDown";
		}

		if (rowDelta === 0 && columnDelta === -1) {
			return "leftTop";
		}

		if (rowDelta === -1 && columnDelta === 0) {
			return "rightTop";
		}

		throw new Error(
			`Movement path contains non-adjacent nodes: (${origin.row}, ${origin.column}) -> (${target.row}, ${target.column}).`,
		);
	}

	/**
	 * Linearly interpolates between two numeric values.
	 */
	private lerp(from: number, to: number, progress: number): number {
		return from + (to - from) * progress;
	}
}
