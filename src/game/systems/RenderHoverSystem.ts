/**
 * File: RenderHoverSystem.ts
 * Path: src/game/systems/
 */

import { System } from "e@ecs/System.js";

import type { Camera } from "e@camera/Camera.js";
import type { Canvas } from "e@canvas/Canvas.js";
import type { RenderQueue } from "e@render/RenderQueue.js";

import type { HoverState } from "g@interaction/HoverState.js";

import type { IsometricProjection } from "g@render/IsometricProjection.js";

/**
 * Renders animated highlights over interactive hovered map tiles.
 *
 * The current hovered tile fades in while rising from the map surface. The
 * previously hovered tile remains renderable during its exit animation,
 * allowing both opacity and vertical displacement to return smoothly to zero.
 *
 * Highlight geometry follows the same isometric tile footprint used by the
 * map and is submitted through the shared RenderQueue so global grid ordering
 * remains deterministic.
 */
export class RenderHoverSystem extends System {
	/**
	 * Canvas receiving highlight drawing operations.
	 */
	private readonly canvas: Canvas;

	/**
	 * Camera used to transform highlight world coordinates into screen space.
	 */
	private readonly camera: Camera;

	/**
	 * Shared render queue receiving deferred highlight drawing commands.
	 */
	private readonly renderQueue: RenderQueue;

	/**
	 * Shared isometric projection describing the tile footprint.
	 */
	private readonly projection: IsometricProjection;

	/**
	 * Shared hover state containing current and previous visual transitions.
	 */
	private readonly hover: HoverState;

	/**
	 * Local render order used to place the highlight above the base map tile.
	 *
	 * The value only participates in ordering when commands occupy the same
	 * logical grid position.
	 */
	private readonly highlightOrder = 5;

	/**
	 * Maximum visual opacity applied when the normalized hover alpha reaches 1.
	 */
	private readonly maximumOpacity = 0.25;

	/**
	 * Creates the required hover rendering system.
	 *
	 * @param canvas - Canvas used for highlight rendering.
	 * @param camera - Shared camera used for world-to-screen transformation.
	 * @param renderQueue - Shared deferred rendering queue.
	 * @param projection - Shared isometric grid projection.
	 * @param hover - Shared animated hover state.
	 */
	public constructor(
		canvas: Canvas,
		camera: Camera,
		renderQueue: RenderQueue,
		projection: IsometricProjection,
		hover: HoverState,
	) {
		super("render", "required");

		this.canvas = canvas;
		this.camera = camera;
		this.renderQueue = renderQueue;
		this.projection = projection;
		this.hover = hover;
	}

	/**
	 * Submits the current and previous hover highlights when their visual
	 * states are active.
	 */
	public override render(): void {
		if (
			this.hover.previousActive &&
			this.hover.previous !== null &&
			this.hover.previousGridRow !== null &&
			this.hover.previousGridColumn !== null
		) {
			this.submitHighlight(
				this.hover.previousGridRow,
				this.hover.previousGridColumn,
				this.hover.previousOpacity,
				this.hover.previousOffset,
			);
		}

		if (
			this.hover.active &&
			this.hover.entity !== null &&
			this.hover.row !== null &&
			this.hover.column !== null
		) {
			this.submitHighlight(
				this.hover.row,
				this.hover.column,
				this.hover.alpha,
				this.hover.lift,
			);
		}
	}

	/**
	 * Submits an animated tile highlight to the shared render queue.
	 *
	 * The highlight uses the complete isometric footprint and receives the
	 * same layer-zero vertical offset and hover lift as the map tile beneath
	 * it. This keeps both visuals aligned throughout the hover animation.
	 *
	 * @param entity - Tile entity associated with the visual state.
	 * @param row - Logical grid row.
	 * @param column - Logical grid column.
	 * @param alpha - Normalized highlight opacity.
	 * @param lift - Current vertical world-space hover displacement.
	 */
	private submitHighlight(row: number, column: number, alpha: number, lift: number): void {
		if (alpha <= 0) {
			return;
		}

		const worldPosition = this.projection.toWorld(row, column);
		const screenPosition = this.camera.worldToScreen(worldPosition.x, worldPosition.y - lift);

		const width = this.projection.width * this.camera.scale;
		const height = this.projection.height * this.camera.scale;

		const centerX = screenPosition.x + width / 2;
		const centerY = screenPosition.y + height / 2;

		const opacity = this.maximumOpacity * Math.min(1, Math.max(0, alpha));

		this.renderQueue.submit({
			row,
			column,
			order: this.highlightOrder,

			execute: () => {
				const context = this.canvas.context2D;

				context.save();

				context.beginPath();

				context.moveTo(centerX, screenPosition.y);
				context.lineTo(screenPosition.x + width, centerY);
				context.lineTo(centerX, screenPosition.y + height);
				context.lineTo(screenPosition.x, centerY);
				context.closePath();

				context.fillStyle = `rgba(255, 255, 255, ${opacity})`;

				context.fill();

				context.restore();
			},
		});
	}
}
