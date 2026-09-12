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
 * Movement and destination feedback configuration.
 */
export const MovementConfig = {
	movement: {
		speed: 40,
		gridTransitionProgress: 0.51,
	},

	selection: {
		color: "#2acfcc",
		baseOpacity: 0.4,
		pulseOpacity: 0.5,
		pulseDuration: 0.5,
		minimumPulseScale: 0.25,
	},
} as const satisfies {
	readonly movement: CharacterMovementConfig;
	readonly selection: SelectionEffectConfig;
};
