/**
 * File: Engine.ts
 * Path: src/engine/
 */

import { Camera } from "e@camera/Camera.js";
import { CanvasManager } from "e@canvas/CanvasManager.js";
import { SceneManager } from "e@controller/scene/SceneManager.js";
import { ECSManagerInstance } from "e@ecs/ECSManager.js";
import { InputManager } from "e@input/InputManager.js";
import { LoaderManagerInstance } from "e@loader/LoaderManager.js";
import { RenderQueue } from "e@render/RenderQueue.js";

import type { Theryn } from "e@types/global.d.ts";

/**
 * Shared canvas manager used by the engine runtime.
 */
const canvasManager = new CanvasManager();

/**
 * Shared render queue used by every rendering system in the engine runtime.
 */
const renderQueue = new RenderQueue();

/**
 * Shared input manager connected to the primary application canvas.
 */
const inputManager = new InputManager(canvasManager.getCanvas("main").element);

/**
 * Public API exposed by the Theryntile engine.
 *
 * Engine subsystems are composed here into a single application-wide API.
 * Shared runtime services reuse the same instances so every subsystem operates
 * against the same engine state.
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
	canvas: canvasManager,

	/**
	 * Shared loader subsystem used to load and resolve engine resources.
	 */
	loader: LoaderManagerInstance,

	/**
	 * Shared ECS runtime used for entities, components, and systems.
	 */
	ecs: ECSManagerInstance,

	/**
	 * Shared render queue used to collect and order deferred rendering
	 * operations during each frame.
	 */
	renderQueue,

	/**
	 * Shared input subsystem used to access device-specific input state.
	 */
	input: inputManager,

	/**
	 * Scene subsystem responsible for scene lifecycle and engine loop
	 * coordination.
	 *
	 * The same ECS, render queue, and input instances exposed publicly through
	 * the Theryn API are injected into the SceneManager so frame execution
	 * operates against one shared runtime.
	 */
	scene: new SceneManager(ECSManagerInstance, renderQueue, inputManager),
};

/**
 * Exposes the Theryntile engine API through the browser window.
 *
 * The global declaration in global.d.ts provides the corresponding TypeScript
 * type information for consumers of this API.
 */
window.Theryn = TherynAPI;
