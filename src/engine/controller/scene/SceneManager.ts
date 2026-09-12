/**
 * File: SceneManager.ts
 * Path: src/engine/controller/scene/
 */

import { LoopController } from "e@controller/LoopController.js";
import { Scene } from "e@controller/scene/Scene.js";

import type { ECSManager } from "e@ecs/ECSManager.js";
import type { RenderQueue } from "e@render/RenderQueue.js";

/**
 * Coordinates scene registration, transitions, lifecycle execution, and the
 * engine frame loop.
 *
 * Scene-scoped systems are registered in the shared ECS runtime when their
 * owning scene is registered. Their enabled state is then controlled
 * automatically during scene transitions.
 *
 * The manager also coordinates the shared render queue. Rendering operations
 * submitted by scenes and ECS systems during a frame are collected first and
 * executed only after every render producer has completed.
 */
export class SceneManager {
	/**
	 * Animation loop used to drive scene updates and rendering.
	 */
	private readonly loopController = new LoopController();

	/**
	 * Registered scenes indexed by their unique names.
	 */
	private readonly scenes = new Map<string, Scene>();

	/**
	 * Shared ECS runtime used to register and execute systems.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Shared render queue used to collect and execute deferred rendering
	 * commands during each frame.
	 */
	private readonly renderQueue: RenderQueue;

	/**
	 * Scene currently active in the engine.
	 */
	private activeScene: Scene | null = null;

	/**
	 * Indicates whether the scene manager has already started the engine loop.
	 */
	private isReady = false;

	/**
	 * Creates a scene manager connected to the shared engine runtime.
	 *
	 * @param ecs - Shared ECS runtime used by registered scenes.
	 * @param renderQueue - Shared render queue used during frame rendering.
	 */
	public constructor(ecs: ECSManager, renderQueue: RenderQueue) {
		this.ecs = ecs;
		this.renderQueue = renderQueue;
	}

	/**
	 * Registers a scene and its scene-scoped systems.
	 *
	 * Scene systems are registered immediately but remain disabled until their
	 * owning scene becomes active.
	 *
	 * @param scene - Scene to register.
	 *
	 * @throws {Error} If another scene already uses the same name.
	 */
	public register(scene: Scene): void {
		if (this.scenes.has(scene.name)) {
			throw new Error(`Scene '${scene.name}' is already registered.`);
		}

		for (const system of scene.getSystems()) {
			this.ecs.registerSystem(system);
		}

		this.scenes.set(scene.name, scene);
	}

	/**
	 * Changes the currently active scene.
	 *
	 * Scene-scoped systems belonging to the previous scene are disabled before
	 * its exit hook executes. Systems belonging to the next scene are enabled
	 * before its enter hook executes.
	 *
	 * Required systems remain unaffected by scene transitions.
	 *
	 * Changing to the currently active scene has no effect.
	 *
	 * @param name - Name of the scene to activate.
	 *
	 * @throws {Error} If the requested scene has not been registered.
	 */
	public change(name: string): void {
		const nextScene = this.scenes.get(name);

		if (!nextScene) {
			throw new Error(`Scene '${name}' is not registered.`);
		}

		if (this.activeScene === nextScene) {
			return;
		}

		if (this.activeScene) {
			for (const system of this.activeScene.getSystems()) {
				this.ecs.disableSystem(system);
			}

			this.activeScene.exit();
		}

		this.activeScene = nextScene;

		for (const system of this.activeScene.getSystems()) {
			this.ecs.enableSystem(system);
		}

		this.activeScene.enter();
	}

	/**
	 * Starts the engine loop using the currently active scene.
	 *
	 * Repeated calls after the manager has started have no effect.
	 *
	 * @throws {Error} If no scene is active when the manager is started.
	 */
	public ready(): void {
		if (this.isReady) {
			return;
		}

		if (!this.activeScene) {
			throw new Error("Cannot start the scene manager without an active scene.");
		}

		this.isReady = true;

		this.loopController.start((deltaTime) => {
			this.update(deltaTime);
			this.render();
		});
	}

	/**
	 * Executes the update phase for the active scene and shared ECS runtime.
	 *
	 * @param deltaTime - Elapsed time since the previous frame in seconds.
	 */
	private update(deltaTime: number): void {
		if (!this.activeScene) {
			return;
		}

		this.activeScene.update(deltaTime);
		this.ecs.update(deltaTime);
	}

	/**
	 * Executes the render phase for the active scene and shared ECS runtime.
	 *
	 * The render queue is reset before producers begin submitting commands.
	 * Scene and ECS rendering then populate the queue, which is flushed only
	 * after every producer has completed.
	 *
	 * This guarantees that rendering order is determined globally rather than
	 * by the order in which individual rendering systems execute.
	 */
	private render(): void {
		if (!this.activeScene) {
			return;
		}

		this.renderQueue.clear();

		this.activeScene.render();
		this.ecs.render();

		this.renderQueue.flush();
	}
}
