/**
 * File: LoaderManager.ts
 * Path: src/engine/loader/
 */

import {
	TextureLoader,
	type SpriteSheetDefinition,
	type TextureRegion,
	type TilesetDefinition,
} from "e@engine/loader/texture/TextureLoader.js";

import type { Texture } from "e@engine/loader/texture/Texture.js";
import type { TextureAnimation } from "e@loader/texture/TextureAnimation.js";

/**
 * Provides the central access point for resource loading operations.
 *
 * Currently delegates texture-related operations to TextureLoader,
 * including tileset registration, sprite sheet loading, and texture retrieval.
 */
export class LoaderManager {
	/**
	 * Texture loader responsible for loading, caching, and resolving
	 * texture resources.
	 */
	private readonly textureLoader = new TextureLoader();

	/**
	 * Loads and registers a tileset.
	 *
	 * The tileset texture is loaded and its tile definitions are
	 * registered for later access through their global numeric IDs.
	 *
	 * @param definition - Tileset definition to load and register.
	 *
	 * @returns A promise that resolves to the loaded Texture instance.
	 */
	public loadTileset(definition: TilesetDefinition): Promise<Texture> {
		return this.textureLoader.loadTileset(definition);
	}

	/**
	 * Loads and registers a sprite sheet texture.
	 *
	 * @param definition - Sprite sheet definition to load.
	 *
	 * @returns A promise that resolves to the loaded Texture instance.
	 */
	public loadSpritesheet(definition: SpriteSheetDefinition): Promise<Texture> {
		return this.textureLoader.loadSpritesheet(definition);
	}

	/**
	 * Resolves a registered texture region by its global numeric ID.
	 *
	 * @param id - Global numeric ID of the texture region.
	 *
	 * @returns The resolved TextureRegion.
	 *
	 * @throws {Error} If no texture region is registered with the provided ID.
	 */
	public get(id: number): TextureRegion {
		return this.textureLoader.get(id);
	}

	/**
	 * Resolves a previously registered sprite sheet animation sequence.
	 *
	 * The sequence is identified by the sprite sheet resource key, animation
	 * group name, and sequence or direction name. Errors from TextureLoader are
	 * propagated when any level of that hierarchy is not registered.
	 *
	 * @param textureKey - Resource key of the registered sprite sheet.
	 * @param animationName - Name of the animation group.
	 * @param sequenceName - Name of the sequence or direction.
	 *
	 * @returns The registered TextureAnimation instance.
	 *
	 * @throws {Error} If the sprite sheet, animation group, or sequence is not registered.
	 */
	public getAnimation(
		textureKey: string,
		animationName: string,
		sequenceName: string,
	): TextureAnimation {
		return this.textureLoader.getAnimation(textureKey, animationName, sequenceName);
	}

	/**
	 * Returns a loaded texture by its resource key.
	 *
	 * If the texture is still loading, the returned promise resolves
	 * when the loading operation completes.
	 *
	 * @param key - Resource key of the texture to retrieve.
	 *
	 * @returns A promise that resolves to the loaded Texture instance.
	 *
	 * @throws {Error} If no texture is registered with the provided key.
	 */
	public getTexture(key: string): Promise<Texture> {
		return this.textureLoader.getTexture(key);
	}
}

/**
 * Shared LoaderManager instance used by the application.
 *
 * Using a single instance keeps loaded resources and registered
 * texture regions available through the same loader state.
 */
export const LoaderManagerInstance = new LoaderManager();
