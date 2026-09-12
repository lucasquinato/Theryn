/**
 * File: RenderMapSystem.ts
 * Path: src/game/systems/
 */

import { System } from "e@ecs/System.js";

import type { Camera } from "e@camera/Camera.js";
import type { Canvas } from "e@canvas/Canvas.js";
import type { ECSManager } from "e@ecs/ECSManager.js";
import type { LoaderManager } from "e@loader/LoaderManager.js";

import { GridPosition } from "g@components/GridPosition.js";
import { Tile } from "g@components/Tile.js";

/**
 * Renders map tile entities using an isometric projection.
 *
 * The system queries entities containing GridPosition and Tile components,
 * projects their logical grid coordinates into world-space coordinates,
 * transforms those coordinates through the camera, and draws the resolved
 * texture regions to the target canvas.
 *
 * The camera is positioned at the visual center of the currently loaded map
 * and uses a fixed zoom level while the initial camera integration is being
 * established.
 *
 * Visual bounds are calculated from the actual texture regions rendered by
 * each tile rather than only from their projected anchor positions. This keeps
 * map centering consistent when tiles use different source dimensions.
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
	 * Camera responsible for transforming world-space coordinates into
	 * screen-space coordinates.
	 */
	private readonly camera: Camera;

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
	 * Zoom level applied while rendering the map through the camera.
	 */
	private readonly cameraZoom = 2;

	/**
	 * Creates the map rendering system.
	 *
	 * @param ecs - Shared ECS runtime containing tile entities.
	 * @param loader - Loader used to resolve tile texture regions.
	 * @param canvas - Canvas receiving map rendering.
	 * @param camera - Camera used to transform world coordinates for rendering.
	 */
	public constructor(ecs: ECSManager, loader: LoaderManager, canvas: Canvas, camera: Camera) {
		super("render", "required");

		this.ecs = ecs;
		this.loader = loader;
		this.canvas = canvas;
		this.camera = camera;
	}

	/**
	 * Renders every tile entity currently available in the ECS.
	 *
	 * The canvas is cleared before rendering as a temporary frame preparation
	 * step. This responsibility should move to the render pipeline once the
	 * render queue is introduced, because individual render systems must not
	 * clear output produced by other render systems.
	 *
	 * Before drawing, the system resolves the visual bounds of every rendered
	 * tile in world space and positions the camera at the center of the complete
	 * rendered map area.
	 */
	public override render(): void {
		const context = this.canvas.context2D;
		const canvas = this.canvas.element;

		context.clearRect(0, 0, canvas.width, canvas.height);

		const entities = this.ecs.query(GridPosition, Tile);

		if (entities.length === 0) {
			return;
		}

		this.camera.setViewport(canvas.width, canvas.height);

		this.camera.setZoom(this.cameraZoom);

		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;

		for (const entity of entities) {
			const position = this.ecs.getComponent(entity, GridPosition);
			const tile = this.ecs.getComponent(entity, Tile);
			if (!position || !tile) {
				continue;
			}

			const region = this.loader.get(tile.id);

			const worldX = (position.column - position.row) * (this.tileWidth / 2);
			const worldY = (position.column + position.row) * (this.tileHeight / 2);

			/**
			 * Applies the current temporary vertical correction based on the
			 * map layer before visual bounds are calculated.
			 */
			const offsetY = (tile.layer + 1) * (this.tileHeight / 2);

			const adjustedWorldY = worldY - offsetY;

			/**
			 * Uses the complete world-space rectangle occupied by the texture
			 * rather than only the tile's projected anchor point.
			 */
			const left = worldX;
			const right = worldX + region.width;

			const top = adjustedWorldY;
			const bottom = adjustedWorldY + region.height;

			minX = Math.min(minX, left);
			maxX = Math.max(maxX, right);

			minY = Math.min(minY, top);
			maxY = Math.max(maxY, bottom);
		}

		if (
			!Number.isFinite(minX) ||
			!Number.isFinite(maxX) ||
			!Number.isFinite(minY) ||
			!Number.isFinite(maxY)
		) {
			return;
		}

		this.camera.setPosition((minX + maxX) / 2, (minY + maxY) / 2);

		for (const entity of entities) {
			const position = this.ecs.getComponent(entity, GridPosition);
			const tile = this.ecs.getComponent(entity, Tile);
			if (!position || !tile) {
				continue;
			}

			const region = this.loader.get(tile.id);

			const worldX = (position.column - position.row) * (this.tileWidth / 2);
			const worldY = (position.column + position.row) * (this.tileHeight / 2);

			/**
			 * Applies a temporary vertical correction based on the map layer.
			 *
			 * This preserves the current visual behavior while layer-aware
			 * composition is still handled directly by this renderer.
			 */
			const offsetY = (tile.layer + 1) * (this.tileHeight / 2);

			const screenPosition = this.camera.worldToScreen(worldX, worldY - offsetY);

			context.drawImage(
				region.texture.image,
				region.x,
				region.y,
				region.width,
				region.height,
				screenPosition.x,
				screenPosition.y,
				region.width * this.camera.scale,
				region.height * this.camera.scale,
			);
		}
	}
}
