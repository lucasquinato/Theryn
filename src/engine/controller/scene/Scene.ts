/**
 * File: Scene.ts
 * Path: src/engine/controller/scene/
 */

import { System } from "e@ecs/System.js";

/**
 * Base class for engine scenes.
 *
 * A scene represents an isolated game state such as a menu, loading screen,
 * world map, combat state, or gameplay environment.
 *
 * Scene instances are managed by the SceneManager, which is responsible for
 * registration, activation, transitions, and per-frame execution.
 *
 * Subclasses may override the lifecycle hooks exposed by this class to
 * implement scene-specific behavior.
 */
export abstract class Scene {
	/**
	 * Unique name used to register and resolve this scene.
	 *
	 * Scene names act as stable identifiers inside the SceneManager and must
	 * not be empty.
	 */
	public readonly name: string;

	/**
	 * ECS systems owned by this scene.
	 *
	 * Only systems using the "scene" scope may be attached here. Their
	 * lifecycle is coordinated automatically by the SceneManager.
	 */
	private readonly systems: System[] = [];

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
	 * Subclasses may override this hook to initialize scene state, create
	 * temporary runtime objects, attach listeners, or perform any setup that
	 * is required when entering the scene.
	 */
	public enter(): void {}

	/**
	 * Called once per engine frame while this scene is active.
	 *
	 * This hook is intended for scene-specific simulation and state updates.
	 * Rendering logic should remain inside render().
	 *
	 * @param deltaTime - Time elapsed since the previous frame, in seconds.
	 */
	public update(deltaTime: number): void {}

	/**
	 * Called once per engine frame after the scene update phase.
	 *
	 * This hook is intended for rendering logic that belongs directly to the
	 * scene rather than to ECS render systems.
	 */
	public render(): void {}

	/**
	 * Called immediately before the scene stops being active.
	 *
	 * Subclasses may override this hook to release temporary state, detach
	 * listeners, destroy scene-owned runtime objects, or perform transition
	 * cleanup.
	 */
	public exit(): void {}

	/**
	 * Attaches an ECS system to this scene lifecycle.
	 *
	 * Scene-owned systems are registered by the SceneManager and are enabled
	 * when this scene becomes active. They are disabled when the scene stops
	 * being active.
	 *
	 * Only systems using the "scene" scope may be attached.
	 *
	 * @param system - Scene-scoped system owned by this scene.
	 *
	 * @throws {Error} If the provided system does not use scene scope.
	 * @throws {Error} If the same system instance is already attached.
	 */
	protected addSystem(system: System): void {
		if (system.scope !== "scene") {
			throw new Error(
				`System "${system.constructor.name}" must use scene scope to belong to a scene.`,
			);
		}

		if (this.systems.includes(system)) {
			throw new Error(
				`System "${system.constructor.name}" is already attached to scene "${this.name}".`,
			);
		}

		this.systems.push(system);
	}

	/**
	 * Returns the ECS systems owned by this scene.
	 *
	 * The returned collection is read-only to callers and is intended for
	 * SceneManager lifecycle coordination.
	 *
	 * @returns Scene-scoped systems attached to this scene.
	 */
	public getSystems(): readonly System[] {
		return this.systems;
	}
}
