/**
 * File: Canvas.ts
 * Path: src/engine/canvas/
 */

import { ClientConfig } from "e@config/ClientConfig.js";

/**
 * Defines the dimensions of a canvas in pixels.
 */
export interface CanvasResolution {
	/**
	 * Canvas width in pixels.
	 */
	readonly width: number;

	/**
	 * Canvas height in pixels.
	 */
	readonly height: number;
}

/**
 * Options used to initialize a Canvas instance.
 */
export interface CanvasOptions {
	/**
	 * Base internal resolution of the canvas in pixels.
	 *
	 * This resolution represents the minimum logical rendering area. When the
	 * available display area uses a different aspect ratio, the internal
	 * buffer may expand on one axis while preserving this base resolution as
	 * its minimum size.
	 */
	readonly resolution: CanvasResolution;

	/**
	 * DOM ID assigned to the canvas element.
	 */
	readonly canvasID: string;
}

/**
 * Represents a canvas used by the engine for rendering.
 *
 * The canvas element is created automatically, assigned the configured
 * DOM ID, and attached to the parent element defined in ClientConfig.
 *
 * The canvas maintains a base logical resolution while allowing its internal
 * rendering buffer to expand when necessary to match the aspect ratio of the
 * available browser area.
 *
 * Its CSS size always fills the available area while the internal buffer
 * remains independent from the rendered DOM dimensions.
 */
export class Canvas {
	/**
	 * Underlying HTML canvas element.
	 */
	private readonly canvas: HTMLCanvasElement;

	/**
	 * 2D rendering context associated with the canvas.
	 */
	private readonly context: CanvasRenderingContext2D;

	/**
	 * ID of the DOM element where the canvas will be attached.
	 */
	private readonly parentID: string = ClientConfig.canvas.parentID;

	/**
	 * Base internal resolution used as the minimum logical rendering area.
	 */
	private readonly baseResolution: CanvasResolution;

	/**
	 * Creates a new canvas with the specified ID and base resolution.
	 *
	 * The canvas is automatically appended to the parent element configured
	 * in ClientConfig.
	 *
	 * @param options - Canvas initialization options.
	 *
	 * @throws {Error} If the 2D rendering context cannot be created.
	 * @throws {Error} If the configured parent element cannot be found.
	 */
	public constructor(options: CanvasOptions) {
		this.baseResolution = options.resolution;

		this.canvas = document.createElement("canvas");
		this.canvas.id = options.canvasID;

		this.canvas.width = options.resolution.width;
		this.canvas.height = options.resolution.height;

		const context2D = this.canvas.getContext("2d");

		if (!context2D) {
			throw new Error("Failed to acquire 2D rendering context.");
		}

		this.context = context2D;

		const parentElement = document.getElementById(this.parentID);

		if (!parentElement) {
			throw new Error(`Parent element with ID '${this.parentID}' not found.`);
		}

		parentElement.appendChild(this.canvas);

		this.canvas.style.width = "100%";
		this.canvas.style.height = "100%";
		this.canvas.style.display = "block";

		this.applyRenderingState();
	}

	/**
	 * Returns the underlying HTML canvas element.
	 */
	public get element(): HTMLCanvasElement {
		return this.canvas;
	}

	/**
	 * Returns the 2D rendering context associated with the canvas.
	 */
	public get context2D(): CanvasRenderingContext2D {
		return this.context;
	}

	/**
	 * Resizes the canvas to fill the available display area.
	 *
	 * Every resize is recalculated from the configured base resolution instead
	 * of from the canvas' current internal buffer.
	 *
	 * The CSS dimensions always occupy the full available width and height.
	 * The internal rendering buffer preserves the aspect ratio of that area by
	 * expanding either its width or height from the configured base resolution.
	 *
	 * The internal buffer never becomes smaller than the base resolution.
	 *
	 * @param availableWidth - Available display width in CSS pixels.
	 * @param availableHeight - Available display height in CSS pixels.
	 */
	public resizeToAvailableArea(availableWidth: number, availableHeight: number): void {
		if (availableWidth <= 0 || availableHeight <= 0) {
			return;
		}

		const baseWidth = this.baseResolution.width;
		const baseHeight = this.baseResolution.height;

		const baseAspectRatio = baseWidth / baseHeight;
		const availableAspectRatio = availableWidth / availableHeight;

		let bufferWidth = baseWidth;
		let bufferHeight = baseHeight;

		if (availableAspectRatio > baseAspectRatio) {
			bufferWidth = Math.ceil(baseHeight * availableAspectRatio);
		} else if (availableAspectRatio < baseAspectRatio) {
			bufferHeight = Math.ceil(baseWidth / availableAspectRatio);
		}

		this.canvas.width = bufferWidth;
		this.canvas.height = bufferHeight;

		this.canvas.style.width = "100%";
		this.canvas.style.height = "100%";
		this.canvas.style.display = "block";

		this.applyRenderingState();
	}

	/**
	 * Applies rendering state that may be reset when the canvas buffer changes.
	 *
	 * Updating the width or height of a canvas resets its 2D rendering context,
	 * so persistent rendering options must be reapplied after every resize.
	 */
	private applyRenderingState(): void {
		this.context.imageSmoothingEnabled = false;
	}
}
