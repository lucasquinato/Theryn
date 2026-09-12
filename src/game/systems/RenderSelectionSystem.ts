/**
 * File: RenderSelectionSystem.ts
 * Path: src/game/systems/
 */

import { System } from "e@ecs/System.js";

import type { Camera } from "e@camera/Camera.js";
import type { Canvas } from "e@canvas/Canvas.js";
import type { RenderQueue } from "e@render/RenderQueue.js";
import type { SelectionState } from "g@interaction/SelectionState.js";
import type { IsometricProjection } from "g@render/IsometricProjection.js";
import type { SelectionEffectConfig } from "g@config/MovementConfig.js";

/**
 * Renders the currently selected destination tile.
 *
 * Selection uses two visual layers:
 *
 * - a persistent base diamond that marks the active destination;
 * - an expanding pulse diamond that fades as it approaches the full tile
 *   footprint.
 *
 * Selection rendering remains independent from hover rendering and does not
 * modify the selected tile's world position.
 */
export class RenderSelectionSystem extends System {
	/**
	 * Canvas receiving selection drawing operations.
	 */
	private readonly canvas: Canvas;

	/**
	 * Camera used to transform selection coordinates into screen space.
	 */
	private readonly camera: Camera;

	/**
	 * Shared render queue receiving deferred selection drawing commands.
	 */
	private readonly renderQueue: RenderQueue;

	/**
	 * Shared isometric projection describing the selected tile footprint.
	 */
	private readonly projection: IsometricProjection;

	/**
	 * Shared selection state containing the active destination and pulse state.
	 */
	private readonly selection: SelectionState;

	/**
	 * Local render order used to draw selection above the map tile.
	 */
	private readonly selectionOrder = 4;

	private readonly config: SelectionEffectConfig;

	/**
	 * Creates the required selection rendering system.
	 *
	 * @param canvas - Canvas used for selection rendering.
	 * @param camera - Shared world camera.
	 * @param renderQueue - Shared deferred rendering queue.
	 * @param projection - Shared isometric grid projection.
	 * @param selection - Shared destination selection state.
	 */
	public constructor(
		canvas: Canvas,
		camera: Camera,
		renderQueue: RenderQueue,
		projection: IsometricProjection,
		selection: SelectionState,
		config: SelectionEffectConfig,
	) {
		super("render", "required");

		this.canvas = canvas;
		this.camera = camera;
		this.renderQueue = renderQueue;
		this.projection = projection;
		this.selection = selection;
		this.config = config;
	}

	/**
	 * Submits the active destination marker to the shared render queue.
	 */
	public override render(): void {
		if (
			!this.selection.active ||
			this.selection.row === null ||
			this.selection.column === null
		) {
			return;
		}

		const row = this.selection.row;
		const column = this.selection.column;

		const worldPosition = this.projection.toWorld(row, column);
		const screenPosition = this.camera.worldToScreen(worldPosition.x, worldPosition.y);

		const width = this.projection.width * this.camera.scale;
		const height = this.projection.height * this.camera.scale;

		const pulseProgress = this.selection.pulseProgress;
		const pulseScale = this.lerp(this.config.minimumPulseScale, 1, pulseProgress);
		const pulseAlpha = 1 - pulseProgress;

		this.renderQueue.submit({
			row,
			column,
			order: this.selectionOrder,

			execute: () => {
				const context = this.canvas.context2D;

				/**
				 * Persistent destination base.
				 */
				this.drawDiamond(
					context,
					screenPosition.x,
					screenPosition.y,
					width,
					height,
					this.config.baseOpacity,
				);

				/**
				 * Expanding pulse centered inside the same tile footprint.
				 */
				const pulseWidth = width * pulseScale;
				const pulseHeight = height * pulseScale;

				const pulseX = screenPosition.x + (width - pulseWidth) / 2;
				const pulseY = screenPosition.y + (height - pulseHeight) / 2;

				this.drawDiamond(
					context,
					pulseX,
					pulseY,
					pulseWidth,
					pulseHeight,
					this.config.pulseOpacity * pulseAlpha,
				);
			},
		});
	}

	/**
	 * Draws a filled isometric diamond.
	 *
	 * @param context - Canvas rendering context.
	 * @param x - Left edge of the diamond bounding box.
	 * @param y - Top edge of the diamond bounding box.
	 * @param width - Diamond bounding width.
	 * @param height - Diamond bounding height.
	 * @param opacity - Fill opacity.
	 */
	private drawDiamond(
		context: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number,
		opacity: number,
	): void {
		const centerX = x + width / 2;
		const centerY = y + height / 2;

		context.save();
		context.beginPath();

		context.moveTo(centerX, y);
		context.lineTo(x + width, centerY);
		context.lineTo(centerX, y + height);
		context.lineTo(x, centerY);

		context.closePath();

		context.fillStyle = this.config.color;
		context.globalAlpha = opacity;

		context.fill();
		context.restore();
	}

	/**
	 * Linearly interpolates between two numeric values.
	 *
	 * @param from - Initial value.
	 * @param to - Target value.
	 * @param progress - Normalized interpolation progress.
	 */
	private lerp(from: number, to: number, progress: number): number {
		return from + (to - from) * progress;
	}
}
