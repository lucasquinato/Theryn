/**
 * File: Engine.ts
 * Path: src/engine/
 */

import { Camera } from "e@camera/Camera.js";
import { CanvasManager } from "e@canvas/CanvasManager.js";
import { SceneManager } from "e@controller/scene/SceneManager.js";
import { LoaderManagerInstance } from "e@loader/LoaderManager.js";
import { ECSManagerInstance } from "e@ecs/ECSManager.js";

import type { Theryn } from "e@types/global.d.ts";

/**
 * Public API exposed by the Theryntile engine.
 *
 * Engine subsystems are composed here into a single application-wide API.
 * Shared runtime services, such as the ECS and loader, reuse their existing
 * instances so every subsystem operates against the same engine state.
 */
const TherynAPI: Theryn = {
	/**
	 * Global camera used by rendering systems to transform world-space
	 * coordinates into screen-space coordinates.
	 */
	camera: new Camera(),

	/**
	 * Canvas subsystem used to create, store, and retrieve application
	 * canvases.
	 */
	canvas: new CanvasManager(),

	/**
	 * Shared loader subsystem used to load and resolve engine resources.
	 */
	loader: LoaderManagerInstance,

	/**
	 * Shared ECS runtime used for entities, components, and systems.
	 */
	ecs: ECSManagerInstance,

	/**
	 * Scene subsystem responsible for scene lifecycle and engine loop
	 * coordination.
	 *
	 * The same ECS instance exposed publicly through Theryn.ecs is injected
	 * into the SceneManager so scene execution and public ECS operations
	 * operate against a single shared runtime.
	 */
	scene: new SceneManager(ECSManagerInstance),
};

/**
 * Exposes the Theryntile engine API through the browser window.
 *
 * The global declaration in global.d.ts provides the corresponding
 * TypeScript type information for consumers of this API.
 */
window.Theryn = TherynAPI;
