/**
 * File: InteractionConfig.ts
 * Path: src/game/config/
 */

/**
 * Configures animated hover feedback for interactive tiles.
 */
export interface HoverEffectConfig {
	/**
	 * Maximum normalized alpha reached by the hover animation.
	 */
	readonly maximumAlpha: number;

	/**
	 * Maximum visual opacity applied by the highlight renderer.
	 */
	readonly maximumOpacity: number;

	/**
	 * Maximum vertical world-space lift applied to hovered tiles.
	 */
	readonly maximumLift: number;

	/**
	 * Responsiveness of the highlight fade transition.
	 */
	readonly fadeSpeed: number;

	/**
	 * Responsiveness of the vertical tile lift transition.
	 */
	readonly liftSpeed: number;

	/**
	 * Threshold used to consider interpolated values settled.
	 */
	readonly epsilon: number;

	/**
	 * CSS color used by the hover highlight.
	 */
	readonly color: string;
}

/**
 * Configures camera zoom controlled through mouse wheel input.
 */
export interface CameraZoomConfig {
	/**
	 * Minimum allowed camera zoom multiplier.
	 */
	readonly minimumZoom: number;

	/**
	 * Maximum allowed camera zoom multiplier.
	 */
	readonly maximumZoom: number;

	/**
	 * Zoom amount applied for each wheel interaction.
	 */
	readonly zoomStep: number;
}

/**
 * Client-side interaction configuration used by Theryntile gameplay systems.
 */
export const InteractionConfig = {
	hover: {
		maximumAlpha: 1,
		maximumOpacity: 1,
		maximumLift: 4,
		fadeSpeed: 5,
		liftSpeed: 12,
		epsilon: 0.01,

		color: "#2acfcc",
	},

	cameraZoom: {
		minimumZoom: 2,
		maximumZoom: 6,
		zoomStep: 0.125,
	},
} as const satisfies {
	readonly hover: HoverEffectConfig;
	readonly cameraZoom: CameraZoomConfig;
};
