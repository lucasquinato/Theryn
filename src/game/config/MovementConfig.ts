/**
 * File: MovementConfig.ts
 * Path: src/game/config/
 */

/**
 * Configures character grid movement.
 */
export interface CharacterMovementConfig {
	/**
	 * Visual movement speed in world-space units per second.
	 */
	readonly speed: number;

	/**
	 * Normalized segment progress at which logical grid ownership moves to the
	 * destination cell.
	 */
	readonly gridTransitionProgress: number;

	/**
	 * Maximum navigation cost allowed for a single movement command.
	 */
	readonly maximumCost: number;
}

/**
 * Configures the selected destination tile effect.
 */
export interface SelectionEffectConfig {
	/**
	 * CSS color used by the destination highlight.
	 */
	readonly color: string;

	/**
	 * Opacity of the persistent destination diamond.
	 */
	readonly baseOpacity: number;

	/**
	 * Maximum opacity of the expanding pulse.
	 */
	readonly pulseOpacity: number;

	/**
	 * Duration of one pulse cycle in seconds.
	 */
	readonly pulseDuration: number;

	/**
	 * Initial pulse scale relative to the full tile footprint.
	 */
	readonly minimumPulseScale: number;
}

/**
 * Configures the reachable movement-range hint.
 */
export interface WalkHintEffectConfig {
	/**
	 * CSS color used by reachable tile hints.
	 */
	readonly color: string;

	/**
	 * Base opacity applied to all currently reachable cells.
	 */
	readonly baseOpacity: number;

	/**
	 * Additional opacity applied by the expanding cost wave.
	 */
	readonly pulseOpacity: number;

	/**
	 * Duration of one complete expansion cycle in seconds.
	 */
	readonly pulseDuration: number;

	/**
	 * Width of the animated wave measured in movement-cost units.
	 */
	readonly pulseWidth: number;
}

/**
 * Movement and destination feedback configuration.
 */
export const MovementConfig = {
	movement: {
		speed: 32,
		gridTransitionProgress: 0.51,
		maximumCost: 5,
	},

	selection: {
		color: "#2acfcc",
		baseOpacity: 0.5,
		pulseOpacity: 1,
		pulseDuration: 1,
		minimumPulseScale: 0.25,
	},

	walkHint: {
		color: "#6fdcff",
		baseOpacity: 0.08,
		pulseOpacity: 0.28,
		pulseDuration: 1.4,
		pulseWidth: 0.8,
	},
} as const satisfies {
	readonly movement: CharacterMovementConfig;
	readonly selection: SelectionEffectConfig;
	readonly walkHint: WalkHintEffectConfig;
};
