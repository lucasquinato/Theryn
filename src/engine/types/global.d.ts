/**
 * File: global.d.ts
 * Path: src/engine/types/
 */

import type { Camera } from "e@camera/Camera";
import type { CanvasManager } from "e@canvas/CanvasManager";
import type { LoaderManager } from "e@loader/LoaderManager";
import type { SceneManager } from "e@controller/scene/SceneManager";
import type { ECSManager } from "e@ecs/ECSManager";

/**
 * Defines the public API exposed by the Theryntile engine.
 *
 * This interface represents the engine services available through the global
 * Theryn object. Each service exposes a specific subsystem while sharing the
 * same engine runtime.
 */
export interface Theryn {
	/**
	 * Camera subsystem responsible for transforming world-space coordinates
	 * into screen-space coordinates according to the current camera position,
	 * viewport, and zoom level.
	 */
	readonly camera: Camera;

	/**
	 * Canvas subsystem responsible for creating, storing, and retrieving
	 * application canvases.
	 */
	readonly canvas: CanvasManager;

	/**
	 * Resource loading subsystem responsible for loading and resolving
	 * textures, tilesets, spritesheets, and other supported resources.
	 */
	readonly loader: LoaderManager;

	/**
	 * Scene subsystem responsible for scene registration, transitions,
	 * lifecycle coordination, and engine loop execution.
	 */
	readonly scene: SceneManager;

	/**
	 * Shared ECS runtime responsible for entities, components, and systems.
	 */
	readonly ecs: ECSManager;
}

/**
 * Declares the Theryn API exposed globally by the engine in browser
 * environments.
 */
declare global {
	/**
	 * Global reference to the Theryntile engine API.
	 */
	const Theryn: Theryn;

	interface Window {
		/**
		 * Theryntile engine API exposed through the browser window.
		 */
		Theryn: Theryn;
	}
}

export {};
