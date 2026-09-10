/**
 * File: TextureAnimation.ts
 * Path: src/engine/loader/texture/
 */

import type { Texture } from "e@engine/loader/texture/Texture.js";

/**
 * Defines the data required to create a resolved texture animation.
 *
 * The animation is represented as a continuous horizontal frame range
 * contained within a single row of a texture grid.
 */
export interface TextureAnimationOptions {
	/**
	 * Texture containing the animation frames.
	 */
	readonly texture: Texture;

	/**
	 * Playback rate of the animation in frames per second.
	 */
	readonly fps: number;

	/**
	 * Zero-based row containing the complete animation sequence.
	 */
	readonly row: number;

	/**
	 * Zero-based column containing the first animation frame.
	 */
	readonly fromColumn: number;

	/**
	 * Zero-based column containing the last animation frame.
	 */
	readonly toColumn: number;

	/**
	 * Width of each animation frame in pixels.
	 */
	readonly frameWidth: number;

	/**
	 * Height of each animation frame in pixels.
	 */
	readonly frameHeight: number;
}

/**
 * Represents a resolved animation sequence inside a texture.
 *
 * Stores the texture reference, frame dimensions, playback rate, and
 * horizontal frame range required to locate the animation frames.
 *
 * This class contains static animation metadata only. Playback state,
 * elapsed time, looping behavior, and current frame selection remain
 * the responsibility of the animation system consuming it.
 */
export class TextureAnimation {
	/**
	 * Texture containing the animation frames.
	 */
	public readonly texture: Texture;

	/**
	 * Playback rate of the animation in frames per second.
	 */
	public readonly fps: number;

	/**
	 * Zero-based row containing the complete animation sequence.
	 */
	public readonly row: number;

	/**
	 * Zero-based column containing the first animation frame.
	 */
	public readonly fromColumn: number;

	/**
	 * Zero-based column containing the last animation frame.
	 */
	public readonly toColumn: number;

	/**
	 * Width of each animation frame in pixels.
	 */
	public readonly frameWidth: number;

	/**
	 * Height of each animation frame in pixels.
	 */
	public readonly frameHeight: number;

	/**
	 * Total number of frames contained in the inclusive animation range.
	 */
	public readonly frameCount: number;

	/**
	 * Creates a resolved texture animation.
	 *
	 * The frame count is derived from the inclusive horizontal range
	 * between fromColumn and toColumn.
	 *
	 * Validation of frame positions, texture bounds, and playback rate
	 * is expected to be performed by the loader before construction.
	 *
	 * @param options - Static texture and frame metadata for the animation.
	 */
	public constructor(options: TextureAnimationOptions) {
		this.texture = options.texture;
		this.fps = options.fps;

		this.row = options.row;
		this.fromColumn = options.fromColumn;
		this.toColumn = options.toColumn;

		this.frameWidth = options.frameWidth;
		this.frameHeight = options.frameHeight;

		this.frameCount = options.toColumn - options.fromColumn + 1;
	}
}
