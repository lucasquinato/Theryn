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
	 * Resolution of the canvas in pixels.
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
 * Provides access to both the underlying HTMLCanvasElement and its
 * 2D rendering context.
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
	 * Creates a new canvas with the specified ID and resolution.
	 *
	 * The canvas is automatically appended to the parent element
	 * configured in ClientConfig.
	 *
	 * @param options - Canvas initialization options.
	 *
	 * @throws {Error} If the 2D rendering context cannot be created.
	 * @throws {Error} If the configured parent element cannot be found.
	 */
	public constructor(options: CanvasOptions) {
		this.canvas = document.createElement("canvas");

		this.canvas.id = options.canvasID;
		this.canvas.width = options.resolution.width;
		this.canvas.height = options.resolution.height;

		const context2D = this.canvas.getContext("2d");
		if (!context2D) {
			throw new Error("Failed to acquire 2D rendering context.");
		}

		this.context = context2D;
		this.context.imageSmoothingEnabled = true;

		const parentElement = document.getElementById(this.parentID);
		if (!parentElement) {
			throw new Error(`Parent element with ID '${this.parentID}' not found.`);
		}

		parentElement.appendChild(this.canvas);
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
}
