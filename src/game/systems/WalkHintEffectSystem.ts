/**
 * File: WalkHintEffectSystem.ts
 * Path: src/game/systems/
 */

import { System } from "e@ecs/System.js";
import type { WalkHintEffectConfig } from "g@config/MovementConfig.js";
import type { WalkHintState } from "g@interaction/WalkHintState.js";
import type { MovementRangeState } from "g@navigation/MovementRangeState.js";

/**
 * Advances the movement-range hint animation.
 *
 * The effect progresses continuously from the movement origin toward the
 * maximum reachable movement cost. Rendering is handled separately by
 * RenderWalkHintSystem.
 *
 * The animation is active only while a movement range exists. When the range
 * disappears, such as while the player is moving, the effect resets.
 */
export class WalkHintEffectSystem extends System {
	/**
	 * Reachable movement range currently available to the player.
	 */
	private readonly range: MovementRangeState;

	/**
	 * Shared temporal state consumed by the walk hint renderer.
	 */
	private readonly hint: WalkHintState;

	/**
	 * Visual configuration controlling the wave cycle.
	 */
	private readonly config: WalkHintEffectConfig;

	/**
	 * Accumulated time inside the current hint cycle.
	 */
	private elapsed: number = 0;

	/**
	 * Creates the walk hint animation system.
	 *
	 * @param range - Shared reachable movement range.
	 * @param hint - Shared walk hint animation state.
	 * @param config - Walk hint effect configuration.
	 */
	public constructor(
		range: MovementRangeState,
		hint: WalkHintState,
		config: WalkHintEffectConfig,
	) {
		super("update", "required");

		if (!Number.isFinite(config.pulseDuration) || config.pulseDuration <= 0) {
			throw new RangeError(
				`Walk hint pulse duration must be greater than zero. Received: ${config.pulseDuration}.`,
			);
		}

		this.range = range;
		this.hint = hint;
		this.config = config;
	}

	/**
	 * Advances the expanding movement-cost wave.
	 *
	 * @param deltaTime - Elapsed frame time in seconds.
	 */
	public override update(deltaTime: number): void {
		if (!this.range.active || this.range.nodes.length === 0) {
			this.reset();
			return;
		}

		const maximumCost = this.getMaximumRangeCost();

		if (maximumCost <= 0) {
			this.reset();
			return;
		}

		this.elapsed = (this.elapsed + deltaTime) % this.config.pulseDuration;

		const progress = this.elapsed / this.config.pulseDuration;

		const pulseCost = progress * maximumCost;

		this.hint.set(progress, pulseCost);
	}

	/**
	 * Resolves the highest movement cost present in the current range.
	 *
	 * Using the actual range instead of the configured maximum prevents the
	 * animation from spending part of its cycle on nonexistent cost levels
	 * when the player is confined to a smaller reachable area.
	 */
	private getMaximumRangeCost(): number {
		let maximumCost = 0;

		for (const node of this.range.nodes) {
			maximumCost = Math.max(maximumCost, node.cost);
		}

		return maximumCost;
	}

	/**
	 * Resets both the internal timer and shared animation state.
	 */
	private reset(): void {
		this.elapsed = 0;
		this.hint.reset();
	}
}
