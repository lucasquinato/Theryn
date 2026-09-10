/**
 * File: CanvasManager.ts
 * Path: src/engine/canvas/
 */

import { ClientConfig } from "e@config/ClientConfig.js";

import { Canvas, type CanvasResolution, type CanvasOptions } from "e@canvas/Canvas.js";

/**
 * Options used to initialize the CanvasManager.
 */
export interface CanvasManagerOptions {
	/**
	 * Whether the default "main" canvas should be created automatically.
	 */
	readonly createDefaultCanvas: boolean;
}

/**
 * Options used when creating a canvas.
 */
export interface CreateCanvasOptions {
	/**
	 * Canvas resolution.
	 *
	 * Falls back to the resolution defined in ClientConfig when omitted.
	 */
	readonly resolution?: CanvasResolution;
}

/**
 * Manages the creation, registration, and retrieval of application canvases.
 *
 * Each canvas is identified by a unique name, which is also assigned
 * as the DOM ID of the underlying canvas element.
 *
 * The client configuration is used as the default source for canvas
 * resolution when no custom resolution is provided.
 */
export class CanvasManager {
	/**
	 * Browser document title obtained from the client configuration.
	 */
	private readonly title: string = ClientConfig.window.title;

	/**
	 * Registered canvases indexed by their unique names.
	 */
	private readonly canvases = new Map<string, Canvas>();

	/**
	 * Creates a new CanvasManager.
	 *
	 * By default, a canvas named "main" is created automatically.
	 *
	 * @param options - Canvas manager initialization options.
	 */
	public constructor(options: CanvasManagerOptions = { createDefaultCanvas: true }) {
		document.title = this.title;

		if (options.createDefaultCanvas) {
			this.createCanvas("main");
		}
	}

	/**
	 * Creates and registers a new canvas.
	 *
	 * The provided name is used both as the registry key and as the
	 * DOM ID assigned to the underlying canvas element.
	 *
	 * When no resolution is provided, the default resolution defined
	 * in ClientConfig is used.
	 *
	 * @param name - Unique name used to identify the canvas.
	 * @param params - Optional canvas creation parameters.
	 *
	 * @returns The newly created Canvas instance.
	 *
	 * @throws {Error} If a canvas with the same name already exists.
	 */
	public createCanvas(name: string, params?: CreateCanvasOptions): Canvas {
		if (this.canvases.has(name)) {
			throw new Error(`Canvas with name "${name}" already exists.`);
		}

		const canvasParams: CanvasOptions = {
			canvasID: name,

			resolution: {
				width: params?.resolution?.width ?? ClientConfig.canvas.resolution.width,
				height: params?.resolution?.height ?? ClientConfig.canvas.resolution.height,
			},
		};

		const canvas = new Canvas(canvasParams);

		this.canvases.set(name, canvas);

		return canvas;
	}

	/**
	 * Returns a registered canvas by name.
	 *
	 * @param name - Name of the canvas to retrieve.
	 *
	 * @returns The registered Canvas instance.
	 *
	 * @throws {Error} If the provided name is empty.
	 * @throws {Error} If no canvas is registered with the provided name.
	 */
	public getCanvas(name: string): Canvas {
		if (!name.trim()) {
			throw new TypeError("Canvas name cannot be empty.");
		}

		const canvas = this.canvases.get(name);
		if (!canvas) {
			throw new Error(`Canvas with name "${name}" is not registered.`);
		}

		return canvas;
	}
}
