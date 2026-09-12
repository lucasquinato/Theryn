/**
 * File: RenderMapSystem.ts
 * Path: src/game/systems/
 */

import { System } from "e@ecs/System.js";

import type { Canvas } from "e@canvas/Canvas.js";
import type { ECSManager } from "e@ecs/ECSManager.js";
import type { LoaderManager } from "e@loader/LoaderManager.js";

import { GridPosition } from "g@components/GridPosition.js";
import { Tile } from "g@components/Tile.js";

/**
 * Renders map tile entities using an isometric projection.
 *
 * The system queries entities containing GridPosition and Tile components,
 * resolves each tile's texture region through the loader, projects its logical
 * grid coordinates into screen coordinates, and draws the result to the target
 * canvas.
 *
 * This system is required because map rendering must remain registered across
 * scene transitions. Whether there are tiles to render depends entirely on the
 * entities currently present in the shared ECS runtime.
 *
 * Render ordering is intentionally basic at this stage. Advanced depth
 * sorting, layer composition, and frame coordination will be handled by the
 * future render queue.
 */
export class RenderMapSystem extends System {
	/**
	 * ECS runtime containing the map entities to render.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Loader used to resolve global tile identifiers into texture regions.
	 */
	private readonly loader: LoaderManager;

	/**
	 * Canvas receiving the rendered map.
	 */
	private readonly canvas: Canvas;

	/**
	 * Horizontal footprint of one logical isometric grid cell in pixels.
	 *
	 * This value describes the grid projection and is independent from the
	 * source texture region dimensions.
	 */
	private readonly tileWidth = 32;

	/**
	 * Vertical footprint of one logical isometric grid cell in pixels.
	 *
	 * This value describes the grid projection and is independent from the
	 * source texture region dimensions.
	 */
	private readonly tileHeight = 16;

	/**
	 * Creates the map rendering system.
	 *
	 * @param ecs - Shared ECS runtime containing tile entities.
	 * @param loader - Loader used to resolve tile texture regions.
	 * @param canvas - Canvas receiving map rendering.
	 */
	public constructor(ecs: ECSManager, loader: LoaderManager, canvas: Canvas) {
		super("render", "required");

		this.ecs = ecs;
		this.loader = loader;
		this.canvas = canvas;
	}

	/**
	 * Renders every tile entity currently available in the ECS.
	 *
	 * The canvas is cleared before rendering as a temporary frame preparation
	 * step. This responsibility should move to the render pipeline once the
	 * render queue is introduced, because individual render systems must not
	 * clear output produced by other render systems.
	 */
	public override render(): void {
		const context = this.canvas.context2D;

		context.clearRect(0, 0, this.canvas.element.width, this.canvas.element.height);

		for (const entity of this.ecs.query(GridPosition, Tile)) {
			const position = this.ecs.getComponent(entity, GridPosition);
			const tile = this.ecs.getComponent(entity, Tile);

			if (!position || !tile) {
				continue;
			}

			const region = this.loader.get(tile.id);

			const screenX = (position.column - position.row) * (this.tileWidth / 2);

			const screenY = (position.column + position.row) * (this.tileHeight / 2);

			/**
			 * Applies a temporary vertical correction based on the map layer.
			 *
			 * This preserves the current visual behavior while layer-aware
			 * composition is still handled directly by this renderer.
			 */
			const offsetY = (tile.layer + 1) * (this.tileHeight / 2);

			context.drawImage(
				region.texture.image,
				region.x,
				region.y,
				region.width,
				region.height,
				screenX,
				screenY - offsetY,
				region.width,
				region.height,
			);
		}
	}
}
