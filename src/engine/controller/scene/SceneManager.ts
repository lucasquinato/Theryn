/**
 * File: SceneManager.ts
 * Path: src/engine/scene/
 */

import { LoopController } from "e@controller/LoopController.js";
import { Scene } from "e@controller/scene/Scene.js";

/**
 * Registers scenes, controls scene transitions, and coordinates
 * execution of the currently active scene through the engine loop.
 *
 * The SceneManager owns the LoopController internally so game code
 * does not need to interact with the engine loop directly.
 *
 * A scene must be explicitly selected through change() before ready()
 * can start the game loop. This allows the game bootstrap to decide
 * the correct initial scene based on runtime state such as login,
 * loading, reconnection, or gameplay restoration.
 */
export class SceneManager {
	/**
	 * Internal controller responsible for scheduling the engine loop.
	 *
	 * Loop execution is intentionally hidden behind the SceneManager.
	 */
	private readonly loopController = new LoopController();

	/**
	 * Registered scene instances indexed by their unique scene names.
	 */
	private readonly scenes = new Map<string, Scene>();

	/**
	 * Scene currently receiving update and render calls.
	 *
	 * Remains null until a registered scene is explicitly selected
	 * through change().
	 */
	private activeScene: Scene | null = null;

	/**
	 * Indicates whether the SceneManager has already started the game loop.
	 *
	 * Once ready() succeeds, subsequent calls are ignored.
	 */
	private isReady = false;

	/**
	 * Registers a scene with the manager.
	 *
	 * Scenes are indexed by the unique name declared by their Scene base class.
	 * Registration does not activate the scene or start the game loop.
	 *
	 * @param scene - Scene instance to register.
	 *
	 * @throws {Error} If another scene with the same name is already registered.
	 */
	public register(scene: Scene): void {
		if (this.scenes.has(scene.name)) {
			throw new Error(`Scene "${scene.name}" is already registered.`);
		}

		this.scenes.set(scene.name, scene);
	}

	/**
	 * Changes the currently active scene.
	 *
	 * The previous active scene receives exit() before the new scene
	 * becomes active and receives enter().
	 *
	 * Requesting the scene that is already active has no effect.
	 *
	 * Scene changes can occur before or after the game loop starts.
	 * The newly active scene will receive subsequent update and render calls.
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

		this.activeScene?.exit();

		this.activeScene = scene;

		this.activeScene.enter();
	}

	/**
	 * Marks scene setup as complete and starts the engine loop.
	 *
	 * An active scene must already have been explicitly selected through
	 * change() before this method is called. The SceneManager intentionally
	 * does not select a default scene automatically.
	 *
	 * Once started, the same engine loop continues running across scene
	 * transitions. Changing scenes does not restart the LoopController.
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
	 * Updates the currently active scene for the current engine frame.
	 *
	 * @param deltaTime - Time elapsed since the previous frame, in seconds.
	 */
	private update(deltaTime: number): void {
		this.activeScene?.update(deltaTime);
	}

	/**
	 * Renders the currently active scene for the current engine frame.
	 */
	private render(): void {
		this.activeScene?.render();
	}
}
