/**
 * File: Engine.ts
 * Path: src/engine/
 */

import { CanvasManager } from "e@canvas/CanvasManager.js";
import { LoaderManagerInstance } from "e@loader/LoaderManager.js";
import { SceneManager } from "e@controller/scene/SceneManager.js";

import type { Theryn } from "e@types/global.d.ts";

/**
 * Public API exposed by the Theryntile engine.
 *
 * Engine services are initialized here and grouped into a single
 * object that serves as the application's global engine interface.
 */
const TherynAPI: Theryn = {
	/**
	 * Canvas manager instance used by the application.
	 */
	canvas: new CanvasManager(),
	scene: new SceneManager(),

	/**
	 * Shared loader manager used to load and retrieve engine resources.
	 */
	loader: LoaderManagerInstance,
};

/**
 * Exposes the engine API through the browser window.
 */
window.Theryn = TherynAPI;
