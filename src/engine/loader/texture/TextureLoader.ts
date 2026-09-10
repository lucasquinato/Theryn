/**
 * File: TextureLoader.ts
 * Path: src/engine/loader/texture/
 */

import { Texture, type TextureOptions } from "e@engine/loader/texture/Texture.js";
import { TextureAnimation } from "e@loader/texture/TextureAnimation.js";

/**
 * Position of a frame inside a regular texture grid.
 *
 * The first value represents the zero-based row and the second
 * value represents the zero-based column.
 */
export type FramePosition = readonly [row: number, column: number];

/**
 * Defines the dimensions of a single frame in pixels.
 */
export interface FrameSize {
	/**
	 * Frame width in pixels.
	 */
	readonly width: number;

	/**
	 * Frame height in pixels.
	 */
	readonly height: number;
}

/**
 * Defines a single tile inside a tileset.
 */
export interface TileDefinition {
	/**
	 * Global numeric ID used to resolve the tile at runtime.
	 */
	readonly id: number;

	/**
	 * Semantic key used to identify the tile definition.
	 */
	readonly key: string;

	/**
	 * Position of the tile frame inside the tileset grid.
	 */
	readonly framePosition: FramePosition;
}

/**
 * Defines a tileset resource and its available tile definitions.
 */
export interface TilesetDefinition {
	/**
	 * Source path of the tileset image.
	 */
	readonly src: string;

	/**
	 * Unique resource key used to cache and identify the loaded texture.
	 */
	readonly key: string;

	/**
	 * Size of each tile frame in pixels.
	 */
	readonly frameSize: FrameSize;

	/**
	 * Tile definitions grouped by semantic category.
	 */
	readonly definitions: Readonly<Record<string, readonly TileDefinition[]>>;
}

/**
 * Defines the inclusive frame range used by an animation sequence.
 */
export interface AnimationFrameRange {
	/**
	 * First frame position of the animation sequence.
	 */
	readonly from: FramePosition;

	/**
	 * Last frame position of the animation sequence.
	 */
	readonly to: FramePosition;
}

/**
 * Defines a single animation sequence inside a sprite sheet.
 */
export interface AnimationSequenceDefinition {
	/**
	 * Frame range used by the animation.
	 *
	 * Animation sequences must remain on a single row and progress
	 * continuously from left to right.
	 */
	readonly frames: AnimationFrameRange;

	/**
	 * Playback rate of the animation in frames per second.
	 */
	readonly fps: number;
}

/**
 * Defines a sprite sheet resource and its available animation sequences.
 */
export interface SpriteSheetDefinition {
	/**
	 * Source path of the sprite sheet image.
	 */
	readonly src: string;

	/**
	 * Unique resource key used to cache and identify the loaded texture.
	 */
	readonly key: string;

	/**
	 * Size of each animation frame in pixels.
	 */
	readonly frameSize: FrameSize;

	/**
	 * Animation definitions grouped first by animation name
	 * and then by sequence or direction name.
	 */
	readonly animations: Readonly<
		Record<string, Readonly<Record<string, AnimationSequenceDefinition>>>
	>;
}

/**
 * Represents a resolved rectangular region inside a texture.
 *
 * The region contains both the source texture and the pixel coordinates
 * required to render a specific frame from that texture.
 */
export interface TextureRegion {
	/**
	 * Global numeric ID associated with the region.
	 */
	readonly id: number;

	/**
	 * Semantic key associated with the region.
	 */
	readonly key: string;

	/**
	 * Texture containing the region.
	 */
	readonly texture: Texture;

	/**
	 * Horizontal source coordinate of the region in pixels.
	 */
	readonly x: number;

	/**
	 * Vertical source coordinate of the region in pixels.
	 */
	readonly y: number;

	/**
	 * Width of the region in pixels.
	 */
	readonly width: number;

	/**
	 * Height of the region in pixels.
	 */
	readonly height: number;
}

/**
 * Internal representation of a registered tile region.
 *
 * Stores the logical tile metadata required to resolve a frame position
 * into concrete source pixel coordinates when get() is called.
 */
interface RegisteredTextureRegion {
	/**
	 * Semantic key of the registered tile.
	 */
	readonly key: string;

	/**
	 * Texture containing the tile frame.
	 */
	readonly texture: Texture;

	/**
	 * Dimensions of the tile frame.
	 */
	readonly frameSize: FrameSize;

	/**
	 * Position of the tile inside the texture grid.
	 */
	readonly framePosition: FramePosition;
}

/**
 * Internal identity associated with a cached texture resource.
 *
 * A resource key represents a single source image and frame configuration
 * during the lifetime of the loader.
 */
interface RegisteredTextureResource {
	/**
	 * Source path associated with the resource key.
	 */
	readonly src: string;

	/**
	 * Configured frame width in pixels.
	 */
	readonly frameWidth?: number;

	/**
	 * Configured frame height in pixels.
	 */
	readonly frameHeight?: number;
}

/**
 * Loads, caches, registers, validates, and resolves texture resources.
 *
 * Texture resources are identified by unique textual keys and loaded only once.
 * Tilesets additionally expose individual texture regions through global numeric IDs.
 *
 * Sprite sheets additionally expose registered animation sequences through their
 * resource key, animation name, and sequence name.
 */
export class TextureLoader {
	/**
	 * Texture loading requests indexed by resource key.
	 *
	 * Promises are cached instead of resolved Texture instances so concurrent
	 * requests for the same resource share the same loading operation.
	 */
	private readonly textures = new Map<string, Promise<Texture>>();

	/**
	 * Resource identities indexed by texture key.
	 *
	 * Prevents the same logical key from being reused with a different
	 * source image or frame configuration.
	 */
	private readonly textureResources = new Map<string, RegisteredTextureResource>();

	/**
	 * Registered tile regions indexed by their global numeric IDs.
	 */
	private readonly regions = new Map<number, RegisteredTextureRegion>();

	/**
	 * Tileset resource keys whose regions have already been registered.
	 *
	 * Repeated calls with the same tileset key reuse the loaded resource
	 * without attempting to register its regions again.
	 */
	private readonly registeredTilesets = new Set<string>();

	/**
	 * Registered sprite sheet animations indexed by sprite sheet resource key,
	 * animation name, and sequence name.
	 */
	private readonly animations = new Map<string, Map<string, Map<string, TextureAnimation>>>();

	/**
	 * Sprite sheet resource keys whose animation sequences have been registered.
	 *
	 * Repeated calls reuse the cached texture and preserve the original animation
	 * instances without attempting another registration.
	 */
	private readonly registeredSpriteSheets = new Set<string>();

	/**
	 * Loads and registers a tileset.
	 *
	 * The source image is loaded once and cached by the tileset resource key.
	 * Before modifying the global region registry, every tile definition is
	 * validated and prepared in a temporary collection.
	 *
	 * Registration is atomic: if any tile definition is invalid, no region
	 * from the current registration attempt is added to the global registry.
	 *
	 * Loading an already registered tileset is idempotent and returns the
	 * cached texture without registering its regions again.
	 *
	 * @param definition - Tileset definition to load and register.
	 *
	 * @returns The loaded Texture instance associated with the tileset.
	 *
	 * @throws {TypeError} If the resource key or source path is empty.
	 * @throws {RangeError} If the configured frame size is invalid.
	 * @throws {RangeError} If the texture dimensions do not match the frame grid.
	 * @throws {RangeError} If a tile ID or frame position is invalid.
	 * @throws {Error} If the resource key conflicts with another texture configuration.
	 * @throws {Error} If a tile ID conflicts with another registered region.
	 * @throws {Error} If a tile ID is duplicated inside the tileset definition.
	 * @throws {Error} If the texture image cannot be loaded.
	 */
	public async loadTileset(definition: TilesetDefinition): Promise<Texture> {
		this.validateFrameSize(definition.frameSize);

		const texture = await this.loadTexture(definition.key, definition.src, {
			frameWidth: definition.frameSize.width,
			frameHeight: definition.frameSize.height,
		});

		this.validateTextureGrid(texture, definition.frameSize);

		if (this.registeredTilesets.has(definition.key)) {
			return texture;
		}

		const pendingRegions = this.prepareTilesetRegistration(texture, definition);
		for (const [id, region] of pendingRegions) {
			this.regions.set(id, region);
		}

		this.registeredTilesets.add(definition.key);

		return texture;
	}

	/**
	 * Loads, validates, and registers a sprite sheet texture and its animations.
	 *
	 * The source image is loaded once and cached by the sprite sheet resource key.
	 * The configured frame size is validated against the physical image dimensions.
	 *
	 * Every declared animation sequence is validated before it is registered.
	 * Registration is atomic: a validation failure leaves this sprite sheet's
	 * animation registry unchanged. Repeated calls are idempotent, reuse the
	 * cached texture, and preserve the originally registered animations.
	 *
	 * @param definition - Sprite sheet definition to load and validate.
	 *
	 * @returns The loaded Texture instance associated with the sprite sheet.
	 *
	 * @throws {TypeError} If the resource key or source path is empty.
	 * @throws {RangeError} If the configured frame size is invalid.
	 * @throws {RangeError} If the texture dimensions do not match the frame grid.
	 * @throws {RangeError} If an animation frame position is invalid.
	 * @throws {RangeError} If an animation crosses multiple texture rows.
	 * @throws {RangeError} If an animation sequence progresses backwards.
	 * @throws {RangeError} If an animation playback rate is invalid.
	 * @throws {Error} If the resource key conflicts with another texture configuration.
	 * @throws {Error} If the texture image cannot be loaded.
	 */
	public async loadSpritesheet(definition: SpriteSheetDefinition): Promise<Texture> {
		this.validateFrameSize(definition.frameSize);

		const texture = await this.loadTexture(definition.key, definition.src, {
			frameWidth: definition.frameSize.width,
			frameHeight: definition.frameSize.height,
		});

		this.validateTextureGrid(texture, definition.frameSize);

		if (this.registeredSpriteSheets.has(definition.key)) {
			return texture;
		}

		const pendingAnimations = this.prepareSpriteSheetRegistration(texture, definition);

		this.animations.set(definition.key, pendingAnimations);
		this.registeredSpriteSheets.add(definition.key);

		return texture;
	}

	/**
	 * Resolves a registered tile region by its global numeric ID.
	 *
	 * The stored grid position is converted into source pixel coordinates
	 * using the frame dimensions associated with the tile's texture.
	 *
	 * @param id - Global numeric ID of the tile region.
	 *
	 * @returns The resolved TextureRegion ready for rendering.
	 *
	 * @throws {Error} If no region is registered with the provided ID.
	 */
	public get(id: number): TextureRegion {
		const region = this.regions.get(id);
		if (!region) {
			throw new Error(`Texture region with ID ${id} is not registered.`);
		}

		const [row, column] = region.framePosition;

		return {
			id,
			key: region.key,

			texture: region.texture,

			x: column * region.frameSize.width,
			y: row * region.frameSize.height,

			width: region.frameSize.width,
			height: region.frameSize.height,
		};
	}

	/**
	 * Resolves a previously registered animation sequence.
	 *
	 * Animations are addressed hierarchically by sprite sheet resource key,
	 * animation name, and sequence or direction name. Registration errors and
	 * missing entries are reported by the texture loader.
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
		const animations = this.animations.get(textureKey);
		if (!animations) {
			throw new Error(`Sprite sheet "${textureKey}" is not registered.`);
		}

		const sequences = animations.get(animationName);
		if (!sequences) {
			throw new Error(
				`Animation "${animationName}" is not registered for sprite sheet "${textureKey}".`,
			);
		}

		const animation = sequences.get(sequenceName);
		if (!animation) {
			throw new Error(
				`Animation sequence "${sequenceName}" is not registered for animation "${animationName}" in sprite sheet "${textureKey}".`,
			);
		}

		return animation;
	}

	/**
	 * Returns a texture loading request by its resource key.
	 *
	 * Because the loader stores Promise<Texture> entries, this method waits
	 * for an in-progress load when necessary and resolves to the loaded texture.
	 *
	 * @param key - Resource key of the texture to retrieve.
	 *
	 * @returns The loaded Texture instance.
	 *
	 * @throws {Error} If no texture is registered with the provided key.
	 */
	public async getTexture(key: string): Promise<Texture> {
		const texture = this.textures.get(key);
		if (!texture) {
			throw new Error(`Texture with key "${key}" is not registered.`);
		}

		return texture;
	}

	/**
	 * Loads and caches a texture by its resource key.
	 *
	 * Each key is associated with one source image and frame configuration
	 * while the resource remains registered in the loader.
	 *
	 * If the same key is requested with the same configuration, the existing
	 * loading request is returned. This also allows concurrent requests to
	 * share a single image loading operation.
	 *
	 * Reusing the same key with another source or frame configuration is
	 * treated as a resource identity conflict.
	 *
	 * Failed requests are removed from both the texture cache and resource
	 * identity registry so the resource can be retried later.
	 *
	 * @param key - Resource key used to identify and cache the texture.
	 * @param src - Source path of the image.
	 * @param options - Additional Texture initialization options.
	 *
	 * @returns A promise that resolves to the loaded Texture instance.
	 *
	 * @throws {TypeError} If the resource key or source path is empty.
	 * @throws {Error} If the key conflicts with another registered texture configuration.
	 */
	private loadTexture(
		key: string,
		src: string,
		options: Omit<TextureOptions, "src"> = {},
	): Promise<Texture> {
		if (!key.trim()) {
			throw new TypeError("Texture key cannot be empty.");
		}

		if (!src.trim()) {
			throw new TypeError("Texture source cannot be empty.");
		}

		const registeredResource = this.textureResources.get(key);
		if (registeredResource) {
			this.validateTextureResource(key, registeredResource, src, options);

			const cached = this.textures.get(key);
			if (cached) {
				return cached;
			}
		}

		this.textureResources.set(key, {
			src,
			frameWidth: options.frameWidth,
			frameHeight: options.frameHeight,
		});

		const request = this.loadImage(src, {
			...options,
			src,
		}).catch((error) => {
			this.textures.delete(key);
			this.textureResources.delete(key);

			throw error;
		});

		this.textures.set(key, request);

		return request;
	}

	/**
	 * Loads an image resource and creates its Texture instance.
	 *
	 * @param src - Source path of the image to load.
	 * @param options - Options used to initialize the resulting Texture.
	 *
	 * @returns A promise that resolves when the image finishes loading.
	 *
	 * @throws {Error} If the image resource cannot be loaded.
	 */
	private loadImage(src: string, options: TextureOptions): Promise<Texture> {
		return new Promise((resolve, reject) => {
			const image = new Image();

			image.onload = () => {
				resolve(new Texture(image, options));
			};

			image.onerror = () => {
				reject(new Error(`Failed to load texture: ${src}`));
			};

			image.src = src;
		});
	}

	/**
	 * Validates and prepares every tile region from a tileset before
	 * modifying the global region registry.
	 *
	 * Existing global region IDs and duplicate IDs inside the current
	 * tileset are detected during this preparation phase.
	 *
	 * Because the global registry is not modified here, a validation failure
	 * leaves the region registry unchanged.
	 *
	 * @param texture - Texture containing the tileset frames.
	 * @param definition - Tileset definition being prepared for registration.
	 *
	 * @returns A temporary map containing all validated regions.
	 *
	 * @throws {RangeError} If a tile ID is not a non-negative integer.
	 * @throws {RangeError} If a tile frame position is invalid.
	 * @throws {Error} If a tile ID is already registered globally.
	 * @throws {Error} If a tile ID appears more than once inside the tileset.
	 */
	private prepareTilesetRegistration(
		texture: Texture,
		definition: TilesetDefinition,
	): Map<number, RegisteredTextureRegion> {
		const pendingRegions = new Map<number, RegisteredTextureRegion>();

		for (const definitions of Object.values(definition.definitions)) {
			for (const tile of definitions) {
				this.validateTileID(tile.id);

				this.validateFramePosition(texture, definition.frameSize, tile.framePosition);

				if (this.regions.has(tile.id)) {
					throw new Error(`Texture region with ID ${tile.id} is already registered.`);
				}

				if (pendingRegions.has(tile.id)) {
					throw new Error(
						`Texture region with ID ${tile.id} is duplicated inside tileset "${definition.key}".`,
					);
				}

				pendingRegions.set(tile.id, {
					key: tile.key,
					texture,
					frameSize: definition.frameSize,
					framePosition: tile.framePosition,
				});
			}
		}

		return pendingRegions;
	}

	/**
	 * Validates and prepares every animation sequence before modifying the
	 * sprite sheet animation registry.
	 *
	 * Each sequence must be a continuous inclusive horizontal range within a
	 * single sprite sheet row. Returning a temporary registry guarantees that
	 * a failed validation cannot produce a partial animation registration.
	 *
	 * @param texture - Texture containing the sprite sheet frames.
	 * @param definition - Sprite sheet definition being prepared for registration.
	 *
	 * @returns A temporary registry containing all validated animations.
	 */
	private prepareSpriteSheetRegistration(
		texture: Texture,
		definition: SpriteSheetDefinition,
	): Map<string, Map<string, TextureAnimation>> {
		const pendingAnimations = new Map<string, Map<string, TextureAnimation>>();

		for (const [animationName, sequences] of Object.entries(definition.animations)) {
			const pendingSequences = new Map<string, TextureAnimation>();

			for (const [sequenceName, sequence] of Object.entries(sequences)) {
				this.validateAnimationSequence(texture, definition.frameSize, sequence);

				const [row, fromColumn] = sequence.frames.from;
				const [, toColumn] = sequence.frames.to;

				pendingSequences.set(
					sequenceName,
					new TextureAnimation({
						texture,
						fps: sequence.fps,
						row,
						fromColumn,
						toColumn,
						frameWidth: definition.frameSize.width,
						frameHeight: definition.frameSize.height,
					}),
				);
			}

			pendingAnimations.set(animationName, pendingSequences);
		}

		return pendingAnimations;
	}

	/**
	 * Validates that a cached texture resource matches a new request.
	 *
	 * Resource keys are stable logical identifiers. Once a key is associated
	 * with a source image and frame configuration, subsequent requests using
	 * that key must describe the same resource.
	 *
	 * @param key - Resource key being requested.
	 * @param resource - Previously registered resource identity.
	 * @param src - Source path supplied by the new request.
	 * @param options - Texture options supplied by the new request.
	 *
	 * @throws {Error} If the source path differs from the registered resource.
	 * @throws {Error} If the configured frame dimensions differ.
	 */
	private validateTextureResource(
		key: string,
		resource: RegisteredTextureResource,
		src: string,
		options: Omit<TextureOptions, "src">,
	): void {
		if (resource.src !== src) {
			throw new Error(
				`Texture key "${key}" is already associated with source "${resource.src}" and cannot be reused for "${src}".`,
			);
		}

		if (
			resource.frameWidth !== options.frameWidth ||
			resource.frameHeight !== options.frameHeight
		) {
			throw new Error(
				`Texture key "${key}" is already registered with frame size ${resource.frameWidth}x${resource.frameHeight} and cannot be reused with frame size ${options.frameWidth}x${options.frameHeight}.`,
			);
		}
	}

	/**
	 * Validates a global tile region ID.
	 *
	 * Region IDs must be non-negative integers because they are used as
	 * stable numeric identifiers inside the global texture region registry.
	 *
	 * @param id - Tile region ID to validate.
	 *
	 * @throws {RangeError} If the ID is not a non-negative integer.
	 */
	private validateTileID(id: number): void {
		if (!Number.isInteger(id) || id < 0) {
			throw new RangeError(
				`Texture region ID must be a non-negative integer. Received: ${id}.`,
			);
		}
	}

	/**
	 * Validates that a frame size contains positive integer dimensions.
	 *
	 * @param frameSize - Frame dimensions to validate.
	 *
	 * @throws {RangeError} If either dimension is not a positive integer.
	 */
	private validateFrameSize(frameSize: FrameSize): void {
		if (
			!Number.isInteger(frameSize.width) ||
			frameSize.width <= 0 ||
			!Number.isInteger(frameSize.height) ||
			frameSize.height <= 0
		) {
			throw new RangeError("Frame dimensions must be positive integers.");
		}
	}

	/**
	 * Validates that a texture can be divided into a regular frame grid.
	 *
	 * Both image dimensions must be exactly divisible by the configured
	 * frame dimensions.
	 *
	 * @param texture - Texture whose dimensions will be validated.
	 * @param frameSize - Frame dimensions used to divide the texture.
	 *
	 * @throws {RangeError} If the texture dimensions are not divisible by the frame size.
	 */
	private validateTextureGrid(texture: Texture, frameSize: FrameSize): void {
		if (
			texture.imageWidth % frameSize.width !== 0 ||
			texture.imageHeight % frameSize.height !== 0
		) {
			throw new RangeError(
				`Texture "${texture.src}" is not divisible by frame size ${frameSize.width}x${frameSize.height}.`,
			);
		}
	}

	/**
	 * Validates that a frame position exists inside a texture grid.
	 *
	 * Frame positions use zero-based [row, column] coordinates.
	 *
	 * @param texture - Texture containing the frame grid.
	 * @param frameSize - Dimensions of each frame in the grid.
	 * @param position - Frame position to validate.
	 *
	 * @throws {RangeError} If the coordinates are invalid or outside the texture grid.
	 */
	private validateFramePosition(
		texture: Texture,
		frameSize: FrameSize,
		position: FramePosition,
	): void {
		const [row, column] = position;
		if (!Number.isInteger(row) || row < 0 || !Number.isInteger(column) || column < 0) {
			throw new RangeError("Frame position must contain non-negative integer coordinates.");
		}

		const rows = texture.imageHeight / frameSize.height;
		const columns = texture.imageWidth / frameSize.width;
		if (row >= rows || column >= columns) {
			throw new RangeError(
				`Frame position [${row}, ${column}] is outside texture "${texture.src}".`,
			);
		}
	}

	/**
	 * Validates a sprite sheet animation sequence.
	 *
	 * Every animation sequence must occupy a single row of the sprite sheet
	 * and progress continuously from left to right.
	 *
	 * Both boundary frames must exist inside the texture grid. Because the
	 * sequence is represented by an inclusive start and end position on the
	 * same row, all intermediate columns form the continuous animation frames.
	 *
	 * The playback rate must also be a finite number greater than zero.
	 *
	 * @param texture - Texture containing the animation frames.
	 * @param frameSize - Dimensions of each frame in the sprite sheet.
	 * @param sequence - Animation sequence definition to validate.
	 *
	 * @throws {RangeError} If either boundary frame is outside the texture grid.
	 * @throws {RangeError} If the animation crosses multiple texture rows.
	 * @throws {RangeError} If the ending column precedes the starting column.
	 * @throws {RangeError} If the playback rate is not finite or greater than zero.
	 */
	private validateAnimationSequence(
		texture: Texture,
		frameSize: FrameSize,
		sequence: AnimationSequenceDefinition,
	): void {
		const { from, to } = sequence.frames;

		this.validateFramePosition(texture, frameSize, from);
		this.validateFramePosition(texture, frameSize, to);

		const [fromRow, fromColumn] = from;
		const [toRow, toColumn] = to;

		if (fromRow !== toRow) {
			throw new RangeError(
				`Animation sequence must remain on a single row. Received range [${fromRow}, ${fromColumn}] to [${toRow}, ${toColumn}].`,
			);
		}

		if (toColumn < fromColumn) {
			throw new RangeError(
				`Animation sequence must progress from left to right. Received range [${fromRow}, ${fromColumn}] to [${toRow}, ${toColumn}].`,
			);
		}

		if (!Number.isFinite(sequence.fps) || sequence.fps <= 0) {
			throw new RangeError(
				`Animation FPS must be greater than zero. Received: ${sequence.fps}.`,
			);
		}
	}
}
