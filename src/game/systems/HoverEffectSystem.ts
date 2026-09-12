/**
 * File: HoverEffectSystem.ts
 * Path: src/game/systems/
 */

import { System } from "e@ecs/System.js";
import type { HoverState } from "g@interaction/HoverState.js";

/**
 * Animates the visual state associated with tile hover interaction.
 *
 * The currently hovered tile fades in and rises toward its configured maximum
 * lift. The previously hovered tile fades out and returns to its original
 * vertical position.
 *
 * Animation uses exponential interpolation based on delta time so transition
 * speed remains stable across different frame rates.
 */
export class HoverEffectSystem extends System {
	/**
	 * Shared hover state containing current and previous visual values.
	 */
	private readonly hover: HoverState;

	/**
	 * Maximum normalized opacity reached by the active highlight.
	 */
	private readonly maximumAlpha = 1;

	/**
	 * Maximum vertical world-space lift applied to the active tile.
	 */
	private readonly maximumLift = 4;

	/**
	 * Responsiveness used by the fade interpolation.
	 */
	private readonly fadeSpeed = 14;

	/**
	 * Responsiveness used by the vertical lift interpolation.
	 */
	private readonly liftSpeed = 16;

	/**
	 * Threshold below which an animation value is considered settled.
	 */
	private readonly epsilon = 0.01;

	/**
	 * Creates the hover visual effect system.
	 *
	 * @param hover - Shared hover state to animate.
	 */
	public constructor(hover: HoverState) {
		super("update", "required");
		this.hover = hover;
	}

	/**
	 * Advances current and previous hover visual transitions.
	 *
	 * @param deltaTime - Elapsed time since the previous frame in seconds.
	 */
	public override update(deltaTime: number): void {
		this.updateCurrent(deltaTime);
		this.updatePrevious(deltaTime);
	}

	/**
	 * Animates the active hovered tile toward full visibility and maximum lift.
	 *
	 * @param deltaTime - Elapsed time since the previous frame in seconds.
	 */
	private updateCurrent(deltaTime: number): void {
		if (!this.hover.active) {
			return;
		}

		const alpha = this.approach(this.hover.alpha, this.maximumAlpha, this.fadeSpeed, deltaTime);
		const lift = this.approach(this.hover.lift, this.maximumLift, this.liftSpeed, deltaTime);

		this.hover.updateCurrentVisual(
			this.snap(alpha, this.maximumAlpha),
			this.snap(lift, this.maximumLift),
		);
	}

	/**
	 * Animates the previous hovered tile toward invisibility and zero lift.
	 *
	 * The previous state is discarded once both values have settled close
	 * enough to zero.
	 *
	 * @param deltaTime - Elapsed time since the previous frame in seconds.
	 */
	private updatePrevious(deltaTime: number): void {
		if (!this.hover.previousActive) {
			return;
		}

		const alpha = this.approach(this.hover.previousOpacity, 0, this.fadeSpeed, deltaTime);
		const lift = this.approach(this.hover.previousOffset, 0, this.liftSpeed, deltaTime);

		const settledAlpha = this.snap(alpha, 0);
		const settledLift = this.snap(lift, 0);

		this.hover.updatePreviousVisual(settledAlpha, settledLift);

		if (settledAlpha === 0 && settledLift === 0) {
			this.hover.clearPrevious();
		}
	}

	/**
	 * Moves a value smoothly toward a target using exponential interpolation.
	 *
	 * This interpolation is frame-rate independent and asymptotically
	 * approaches the target while preserving smooth motion.
	 *
	 * @param current - Current value.
	 * @param target - Desired value.
	 * @param speed - Transition responsiveness.
	 * @param deltaTime - Elapsed frame time in seconds.
	 *
	 * @returns The interpolated value.
	 */
	private approach(current: number, target: number, speed: number, deltaTime: number): number {
		const factor = 1 - Math.exp(-speed * deltaTime);

		return current + (target - current) * factor;
	}

	/**
	 * Snaps a value exactly to its target when it is sufficiently close.
	 *
	 * @param value - Current interpolated value.
	 * @param target - Desired target value.
	 *
	 * @returns The target when within the configured threshold, otherwise the
	 * original value.
	 */
	private snap(value: number, target: number): number {
		if (Math.abs(target - value) <= this.epsilon) {
			return target;
		}

		return value;
	}
}
