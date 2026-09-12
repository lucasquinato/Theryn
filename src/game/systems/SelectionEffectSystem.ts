/**
 * File: SelectionEffectSystem.ts
 * Path: src/game/systems/
 */

import { System } from "e@ecs/System.js";

import type { SelectionState } from "g@interaction/SelectionState.js";
import type { SelectionEffectConfig } from "g@config/MovementConfig.js";

/**
 * Advances the repeating visual pulse of the selected destination tile.
 *
 * The system updates only normalized animation progress. Rendering geometry,
 * color, opacity, and scale remain the responsibility of the selection render
 * system and its visual configuration.
 */
export class SelectionEffectSystem extends System {
	/**
	 * Shared destination selection state.
	 */
	private readonly selection: SelectionState;

	private readonly config: SelectionEffectConfig;

	/**
	 * Creates the selection visual effect system.
	 *
	 * @param selection - Shared destination selection state.
	 */
	public constructor(selection: SelectionState, config: SelectionEffectConfig) {
		super("update", "required");

		this.selection = selection;
		this.config = config;
	}

	/**
	 * Advances the repeating selection pulse.
	 *
	 * @param deltaTime - Elapsed time since the previous frame in seconds.
	 */
	public override update(deltaTime: number): void {
		if (!this.selection.active) {
			return;
		}

		const progressDelta = deltaTime / this.config.pulseDuration;

		const nextProgress = (this.selection.pulseProgress + progressDelta) % 1;

		this.selection.setPulseProgress(nextProgress);
	}
}
