/**
 * File: global.d.ts
 * Path: src/engine/types/
 */

import type { CanvasManager } from "e@canvas/CanvasManager";
import type { LoaderManager } from "e@loader/LoaderManager";
import type { SceneManager } from "e@controller/scene/SceneManager";

/**
 * Defines the public API exposed by the Theryntile engine.
 *
 * This interface describes the engine services available through
 * the global Theryn object.
 */
export interface Theryn {
	/**
	 * Canvas manager responsible for creating, storing, and
	 * retrieving application canvases.
	 */
	readonly canvas: CanvasManager;

	/**
	 * Loader manager responsible for loading and retrieving
	 * engine resources.
	 */
	readonly loader: LoaderManager;

	readonly scene: SceneManager;
}

/**
 * Declares the global Theryn API exposed by the engine.
 */
declare global {
	/**
	 * Global reference to the Theryn engine API.
	 */
	const Theryn: Theryn;

	interface Window {
		/**
		 * Theryn engine API exposed through the browser window.
		 */
		Theryn: Theryn;
	}
}

export {};
