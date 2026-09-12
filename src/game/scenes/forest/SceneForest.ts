/**
 * File: Forest.ts
 * Path: src/game/scenes/forest/
 */

import { Scene } from "e@controller/scene/Scene.js";

import { MapInstance } from "g@maps/MapInstance.js";
import { SceneData } from "g@scenes/SceneData.js";

/**
 * Represents the forest game scene.
 *
 * The scene owns the runtime instance of its map and coordinates its lifecycle
 * with the scene lifecycle. Map entities are created when the scene becomes
 * active and destroyed when the scene is exited.
 *
 * The current timed transition to the lobby is temporary and exists only to
 * validate scene transitions and map lifecycle behavior.
 */
export class Forest extends Scene {
	/**
	 * Runtime map instance owned by this scene.
	 *
	 * The map uses the shared ECS runtime so its tile entities are visible to
	 * the engine's registered systems while this scene is active.
	 */
	private readonly map = new MapInstance(Theryn.ecs, SceneData.forest.map);

	/**
	 * Elapsed time used by the temporary scene transition test.
	 */
	private elapsedTime = 0;

	/**
	 * Creates the forest scene.
	 */
	public constructor() {
		super(SceneData.forest.name);
	}

	/**
	 * Activates the forest scene.
	 *
	 * The temporary transition timer is reset and the scene map is
	 * instantiated inside the shared ECS runtime.
	 */
	public override enter(): void {
		this.elapsedTime = 0;
		this.map.load();
	}

	/**
	 * Deactivates the forest scene.
	 *
	 * All entities owned by the forest map instance are removed from the ECS.
	 */
	public override exit(): void {
		this.map.unload();
	}

	/**
	 * Updates the temporary scene transition test.
	 *
	 * The forest remains active for ten seconds before switching to the lobby
	 * scene. This behavior is temporary and is not part of the final scene
	 * lifecycle architecture.
	 *
	 * @param deltaTime - Time elapsed since the previous frame, in seconds.
	 */
	public override update(deltaTime: number): void {
		this.elapsedTime += deltaTime;

		if (this.elapsedTime >= 10) {
			Theryn.scene.change(SceneData.lobby.name);
		}
	}
}
