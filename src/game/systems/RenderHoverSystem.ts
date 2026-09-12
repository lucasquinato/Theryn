/**
 * File: RenderHoverSystem.ts
 * Path: src/game/systems/
 */

import type { Camera } from "e@camera/Camera.js";
import type { Canvas } from "e@canvas/Canvas.js";
import { System } from "e@ecs/System.js";
import type { RenderQueue } from "e@render/RenderQueue.js";
import type { HoverState } from "g@interaction/HoverState.js";
import type { IsometricProjection } from "g@render/IsometricProjection.js";

/**
 * Renders the visual highlight for the currently hovered map tile.
 *
 * The system consumes only the resolved hover state. Mouse input and tile
 * eligibility are handled independently by HoverSystem.
 *
 * The highlight is submitted through the shared render queue using the same
 * logical grid position as the hovered tile, preserving the engine's global
 * isometric render ordering.
 */
export class RenderHoverSystem extends System {
	/**
	 * Canvas used for highlight rendering.
	 */
	private readonly canvas: Canvas;

	/**
	 * Camera used to transform world-space coordinates into screen-space.
	 */
	private readonly camera: Camera;

	/**
	 * Shared render queue used to defer highlight rendering.
	 */
	private readonly renderQueue: RenderQueue;

	/**
	 * Shared isometric projection used to resolve the hovered tile footprint.
	 */
	private readonly projection: IsometricProjection;

	/**
	 * Shared hover state containing the currently selected grid cell.
	 */
	private readonly hover: HoverState;

	/**
	 * Local render order used to place the highlight above the base tile while
	 * preserving row and column ordering.
	 */
	private readonly order = 5;

	/**
	 * Creates the hover rendering system.
	 *
	 * @param canvas - Canvas used for rendering.
	 * @param camera - Shared world camera.
	 * @param renderQueue - Shared deferred render queue.
	 * @param projection - Shared isometric grid projection.
	 * @param hover - Shared tile hover state.
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
	 * Submits the current hover highlight for deferred rendering.
	 */
	public override render(): void {
		if (!this.hover.active || this.hover.row === null || this.hover.column === null) {
			return;
		}

		const row = this.hover.row;
		const column = this.hover.column;

		const world = this.projection.toWorld(row, column);
		const screen = this.camera.worldToScreen(world.x, world.y);

		const width = this.projection.width * this.camera.scale;
		const height = this.projection.height * this.camera.scale;

		const centerX = screen.x + width / 2;
		const centerY = screen.y + height / 2;

		this.renderQueue.submit({
			row,
			column,
			order: this.order,

			execute: () => {
				const context = this.canvas.context2D;

				context.save();

				context.beginPath();

				context.moveTo(centerX, screen.y);
				context.lineTo(screen.x + width, centerY);
				context.lineTo(centerX, screen.y + height);
				context.lineTo(screen.x, centerY);

				context.closePath();

				context.fillStyle = "rgba(255, 255, 255, 0.20)";
				context.strokeStyle = "rgba(255, 255, 255, 0.85)";
				context.lineWidth = 1;

				context.fill();
				context.stroke();

				context.restore();
			},
		});
	}
}
