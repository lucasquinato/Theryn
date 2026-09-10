/**
 * File: Texture.ts
 * Path: src/engine/loader/texture/
 */

/**
 * Options used to initialize a Texture instance.
 */
export interface TextureOptions {
	/**
	 * Source path of the texture.
	 */
	readonly src: string;

	/**
	 * Animation playback rate in frames per second.
	 *
	 * Defaults to 1 when omitted.
	 */
	readonly fps?: number;

	/**
	 * Total number of animation frames.
	 *
	 * Defaults to 1 when omitted.
	 */
	readonly frames?: number;

	/**
	 * Width of a single frame in pixels.
	 *
	 * Defaults to the full image width when omitted.
	 */
	readonly frameWidth?: number;

	/**
	 * Height of a single frame in pixels.
	 *
	 * Defaults to the full image height when omitted.
	 */
	readonly frameHeight?: number;
}

/**
 * Represents a loaded texture and its rendering metadata.
 *
 * Stores the source image, dimensions, and optional animation
 * information such as frame count, frame size, and playback rate.
 */
export class Texture {
	/**
	 * Loaded image associated with the texture.
	 */
	public readonly image: HTMLImageElement;

	/**
	 * Source path of the texture.
	 */
	public readonly src: string;

	/**
	 * Animation playback rate in frames per second.
	 */
	public readonly fps: number;

	/**
	 * Total number of animation frames.
	 */
	public readonly frames: number;

	/**
	 * Width of a single frame in pixels.
	 */
	public readonly frameWidth: number;

	/**
	 * Height of a single frame in pixels.
	 */
	public readonly frameHeight: number;

	/**
	 * Total width of the source image in pixels.
	 */
	public readonly imageWidth: number;

	/**
	 * Total height of the source image in pixels.
	 */
	public readonly imageHeight: number;

	/**
	 * Creates a texture from a loaded image and its metadata.
	 *
	 * When animation properties are omitted, the texture defaults
	 * to a single frame using the full image dimensions.
	 *
	 * @param image - Loaded HTML image used by the texture.
	 * @param options - Texture source and optional animation metadata.
	 */
	public constructor(image: HTMLImageElement, options: TextureOptions) {
		const imageWidth = image.width;
		const imageHeight = image.height;

		this.image = image;

		this.src = options.src;

		this.fps = options.fps ?? 1;
		this.frames = options.frames ?? 1;

		this.frameWidth = options.frameWidth ?? imageWidth;
		this.frameHeight = options.frameHeight ?? imageHeight;

		this.imageWidth = imageWidth;
		this.imageHeight = imageHeight;
	}
}
