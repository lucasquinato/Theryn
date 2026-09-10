/**
 * File: ClientConfig.ts
 * Path: src/engine/config/
 */

import type { CanvasResolution } from "e@engine/canvas/Canvas.js";

/**
 * Defines the available client debugging levels.
 */
export interface ClientDebugOptions {
	/**
	 * Controls which debugging behavior is enabled.
	 */
	readonly level: "all" | "debug" | "none";
}

/**
 * Defines the browser window configuration.
 */
export interface ClientWindowOptions {
	/**
	 * Title displayed by the browser document.
	 */
	readonly title: string;
}

/**
 * Defines the canvas configuration used by the client.
 */
export interface ClientCanvasOptions {
	/**
	 * ID of the DOM element where canvases will be attached.
	 */
	readonly parentID: string;

	/**
	 * Default canvas resolution in pixels.
	 */
	readonly resolution: CanvasResolution;
}

/**
 * Defines the complete client-side configuration structure.
 */
export interface ClientConfigOptions {
	/**
	 * Client debugging configuration.
	 */
	readonly debug: ClientDebugOptions;

	/**
	 * Browser window configuration.
	 */
	readonly window: ClientWindowOptions;

	/**
	 * Canvas configuration.
	 */
	readonly canvas: ClientCanvasOptions;
}

/**
 * Defines the client-side configuration used by the engine.
 *
 * Contains global settings for debugging, browser window behavior,
 * and canvas initialization.
 */
export const ClientConfig = {
	debug: {
		level: "all",
	},

	window: {
		title: "Theryntile",
	},

	canvas: {
		parentID: "__body__app",

		resolution: {
			width: 640,
			height: 360,
		},
	},
} as const satisfies ClientConfigOptions;
