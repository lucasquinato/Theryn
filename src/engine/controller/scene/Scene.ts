/**
 * File: Scene.ts
 * Path: src/engine/scene/
 */

/**
 * Base class for engine scenes.
 *
 * A scene represents an independent game state such as a menu,
 * loading screen, world map, combat state, or gameplay environment.
 *
 * Scene instances are managed by the SceneManager, which controls
 * registration, activation, transitions, and per-frame execution.
 *
 * Subclasses may override the lifecycle methods provided by this class
 * to implement scene-specific behavior.
 */
export abstract class Scene {
	/**
	 * Unique name used to register and resolve the scene.
	 *
	 * Scene names act as stable identifiers inside the SceneManager
	 * and must not be empty.
	 */
	public readonly name: string;

	/**
	 * Creates a scene with a unique registration name.
	 *
	 * @param name - Name used to identify the scene inside the SceneManager.
	 *
	 * @throws {TypeError} If the provided scene name is empty.
	 */
	public constructor(name: string) {
		if (!name.trim()) {
			throw new TypeError("Scene name cannot be empty.");
		}

		this.name = name;
	}

	/**
	 * Called when the scene becomes the active scene.
	 *
	 * This hook can be overridden to initialize scene state,
	 * prepare resources, or perform logic required when entering
	 * the scene.
	 */
	public enter(): void {}

	/**
	 * Called once per engine frame while the scene is active.
	 *
	 * This hook should contain scene-specific simulation and state
	 * update logic. Rendering should remain inside render().
	 *
	 * @param deltaTime - Time elapsed since the previous frame, in seconds.
	 */
	public update(deltaTime: number): void {}

	/**
	 * Called once per engine frame after the scene update.
	 *
	 * This hook should contain the rendering logic associated with
	 * the active scene.
	 */
	public render(): void {}

	/**
	 * Called immediately before the scene stops being active.
	 *
	 * This hook can be overridden to release temporary state,
	 * detach scene-specific listeners, or perform transition cleanup.
	 */
	public exit(): void {}
}
