/**
 * File: SceneData.ts
 * Path: src/game/scenes/
 */

import { forestMap } from "g@maps/data/forest.data.map.js";
import { lobbyMap } from "g@maps/data/lobby.data.map.js";

/**
 * Central registry containing the static definitions of the game's scenes.
 *
 * Each entry associates a unique scene name with the map definition used by
 * that scene. Scene classes consume this registry to avoid duplicating scene
 * identifiers or importing map definitions directly.
 *
 * The registry is immutable and represents configuration data only. Runtime
 * scene state and lifecycle behavior remain inside the corresponding Scene
 * implementations.
 */
export const SceneData = {
	/**
	 * Static configuration for the lobby scene.
	 */
	lobby: {
		name: "LOBBY",
		map: lobbyMap,
	},

	/**
	 * Static configuration for the forest scene.
	 */
	forest: {
		name: "FOREST",
		map: forestMap,
	},
} as const;
