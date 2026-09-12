/**
 * File: SceneManager.ts
 * Path: src/engine/controller/scene/
 */

import { Scene } from "e@controller/scene/Scene.js";
import { LoopController } from "e@controller/LoopController.js";
import { ECSManager } from "e@ecs/ECSManager.js";

/**
 * Registers scenes, controls scene transitions, and coordinates execution
 * of the active scene and the shared ECS runtime through the engine loop.
 *
 * The SceneManager owns the LoopController internally so game code does not
 * need to interact with frame scheduling directly.
 *
 * A scene must be explicitly selected through change() before ready() can
 * start the engine loop. This allows the game bootstrap to determine the
 * correct initial scene according to runtime state instead of relying on an
 * implicit default.
 *
 * The engine loop remains active across scene transitions. Changing scenes
 * only replaces the active scene and coordinates the lifecycle of its
 * scene-scoped ECS systems.
 */
export class SceneManager {
	/**
	 * Internal controller responsible for scheduling engine frames.
	 *
	 * Loop execution is intentionally encapsulated by the SceneManager.
	 */
	private readonly loopController = new LoopController();

	/**
	 * Registered scene instances indexed by their unique names.
	 */
	private readonly scenes = new Map<string, Scene>();

	/**
	 * Shared ECS runtime executed alongside the active scene.
	 *
	 * The same ECS instance is used across all scenes so required systems
	 * remain alive while scene-scoped systems are activated and deactivated
	 * during transitions.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Scene currently receiving lifecycle, update, and render calls.
	 *
	 * Remains null until a registered scene is explicitly selected through
	 * change().
	 */
	private activeScene: Scene | null = null;

	/**
	 * Indicates whether the engine loop has already been started.
	 *
	 * Once ready() completes successfully, subsequent calls have no effect.
	 */
	private isReady = false;

	/**
	 * Creates a scene manager bound to the shared ECS runtime.
	 *
	 * @param ecs - ECS runtime executed alongside the active scene.
	 */
	public constructor(ecs: ECSManager) {
		this.ecs = ecs;
	}

	/**
	 * Registers a scene and its scene-scoped ECS systems.
	 *
	 * Registration makes the scene available for future transitions but does
	 * not activate it or start the engine loop.
	 *
	 * Systems attached to the scene are registered in the shared ECS runtime
	 * immediately. Because scene-scoped systems start disabled, they will not
	 * execute until the scene becomes active.
	 *
	 * @param scene - Scene instance to register.
	 *
	 * @throws {Error} If another scene with the same name is already
	 * registered.
	 */
	public register(scene: Scene): void {
		if (this.scenes.has(scene.name)) {
			throw new Error(`Scene "${scene.name}" is already registered.`);
		}

		for (const system of scene.getSystems()) {
			this.ecs.registerSystem(system);
		}

		this.scenes.set(scene.name, scene);
	}

	/**
	 * Changes the currently active scene.
	 *
	 * When leaving a scene, its scene-scoped ECS systems are disabled before
	 * exit() is called. The target scene then becomes active, its systems are
	 * enabled, and enter() is called.
	 *
	 * Required ECS systems are not affected by scene transitions and continue
	 * to exist for the lifetime of the shared ECS runtime.
	 *
	 * Requesting the scene that is already active has no effect.
	 *
	 * Scene transitions may occur before or after the engine loop starts.
	 * Changing scenes while the loop is running does not restart the
	 * LoopController.
	 *
	 * @param name - Name of the registered scene to activate.
	 *
	 * @throws {Error} If no scene is registered with the provided name.
	 */
	public change(name: string): void {
		const scene = this.scenes.get(name);

		if (!scene) {
			throw new Error(`Scene "${name}" is not registered.`);
		}

		if (scene === this.activeScene) {
			return;
		}

		if (this.activeScene) {
			for (const system of this.activeScene.getSystems()) {
				this.ecs.disableSystem(system);
			}

			this.activeScene.exit();
		}

		this.activeScene = scene;

		for (const system of this.activeScene.getSystems()) {
			this.ecs.enableSystem(system);
		}

		this.activeScene.enter();
	}

	/**
	 * Marks scene setup as complete and starts the engine loop.
	 *
	 * An active scene must already have been selected explicitly through
	 * change(). The SceneManager intentionally does not choose a default scene
	 * automatically.
	 *
	 * Once started, the same loop continues running across all subsequent
	 * scene transitions.
	 *
	 * Repeated calls after a successful start have no effect.
	 *
	 * @throws {Error} If no active scene has been selected.
	 */
	public ready(): void {
		if (this.isReady) {
			return;
		}

		if (!this.activeScene) {
			throw new Error("Cannot start the scene loop without an active scene.");
		}

		this.isReady = true;

		this.loopController.start((deltaTime) => {
			this.update(deltaTime);
			this.render();
		});
	}

	/**
	 * Executes the update phase for the current engine frame.
	 *
	 * Scene-specific update logic runs first, followed by all enabled ECS
	 * systems registered for the update phase.
	 *
	 * @param deltaTime - Time elapsed since the previous frame, in seconds.
	 */
	private update(deltaTime: number): void {
		this.activeScene?.update(deltaTime);
		this.ecs.update(deltaTime);
	}

	/**
	 * Executes the render phase for the current engine frame.
	 *
	 * Scene-specific rendering runs first, followed by all enabled ECS
	 * systems registered for the render phase.
	 */
	private render(): void {
		this.activeScene?.render();
		this.ecs.render();
	}
}
