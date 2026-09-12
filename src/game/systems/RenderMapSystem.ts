/**
 * File: RenderMapSystem.ts
 * Path: src/game/systems/
 */

import { System } from "e@ecs/System.js";

import type { Camera } from "e@camera/Camera.js";
import type { Canvas } from "e@canvas/Canvas.js";
import type { ECSManager } from "e@ecs/ECSManager.js";
import type { LoaderManager } from "e@loader/LoaderManager.js";
import type { RenderQueue } from "e@render/RenderQueue.js";

import { GridPosition } from "g@components/GridPosition.js";
import { Tile } from "g@components/Tile.js";

/**
 * Renders map tile entities using an isometric projection.
 *
 * The system queries entities containing GridPosition and Tile components,
 * projects their logical grid coordinates into world-space coordinates,
 * transforms those coordinates through the camera, and submits deferred
 * drawing operations to the shared render queue.
 *
 * Tile rendering order is determined exclusively by GridPosition through the
 * RenderQueue. Map layers and visual texture dimensions do not participate in
 * ordering.
 *
 * The camera is currently positioned at the visual center of the loaded map
 * and uses a fixed zoom level while the initial camera implementation remains
 * focused on automatic map framing.
 *
 * Visual map bounds are calculated from the actual texture regions rendered by
 * each tile so camera centering reflects the complete visible map rather than
 * only the projected grid anchors.
 *
 * This system is required because map rendering remains registered across
 * scene transitions. Whether there are tiles to render depends entirely on the
 * entities currently present in the shared ECS runtime.
 */
export class RenderMapSystem extends System {
	/**
	 * Shared ECS runtime containing map tile entities.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Resource loader used to resolve tile texture regions.
	 */
	private readonly loader: LoaderManager;

	/**
	 * Canvas receiving the final tile drawing operations.
	 */
	private readonly canvas: Canvas;

	/**
	 * Camera used to transform projected world coordinates into screen space.
	 */
	private readonly camera: Camera;

	/**
	 * Shared render queue receiving deferred tile drawing commands.
	 */
	private readonly renderQueue: RenderQueue;

	/**
	 * Logical width of one isometric grid cell in world-space pixels.
	 */
	private readonly tileWidth = 32;

	/**
	 * Logical height of one isometric grid cell in world-space pixels.
	 */
	private readonly tileHeight = 16;

	/**
	 * Fixed camera zoom used during the initial camera implementation.
	 */
	private readonly cameraZoom = 2;

	/**
	 * Local render order assigned to map tiles.
	 *
	 * The value only participates in ordering when another render command
	 * occupies the exact same grid position.
	 */
	private readonly tileOrder = 0;

	/**
	 * Creates the required map rendering system.
	 *
	 * @param ecs - Shared ECS runtime containing map entities.
	 * @param loader - Resource loader used to resolve tile textures.
	 * @param canvas - Canvas used to render the map.
	 * @param camera - Shared camera used for world-to-screen transformation.
	 * @param renderQueue - Shared queue used for global grid-based ordering.
	 */
	public constructor(
		ecs: ECSManager,
		loader: LoaderManager,
		canvas: Canvas,
		camera: Camera,
		renderQueue: RenderQueue,
	) {
		super("render", "required");

		this.ecs = ecs;
		this.loader = loader;
		this.canvas = canvas;
		this.camera = camera;
		this.renderQueue = renderQueue;
	}

	/**
	 * Collects visible map tiles and submits their drawing operations to the
	 * shared render queue.
	 *
	 * Camera configuration and map bounds are resolved before submission so
	 * every command receives its final screen-space drawing coordinates.
	 *
	 * Actual drawing does not occur inside this method. Submitted commands are
	 * executed later when the RenderQueue is flushed by the frame coordinator.
	 */
	public override render(): void {
		const context = this.canvas.context2D;
		const canvas = this.canvas.element;

		/*
		 * Frame clearing remains here temporarily while rendering is migrated
		 * to the shared queue. It can move to a dedicated frame coordinator
		 * once multiple render producers require centralized canvas control.
		 */
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

		/*
		 * Resolve the complete visual bounds of the currently loaded map before
		 * positioning the camera.
		 *
		 * Texture dimensions participate only in camera framing. They do not
		 * participate in render ordering.
		 */
		for (const entity of entities) {
			const position = this.ecs.getComponent(entity, GridPosition);
			const tile = this.ecs.getComponent(entity, Tile);
			if (!position || !tile) {
				continue;
			}

			const region = this.loader.get(tile.id);

			const worldX = (position.column - position.row) * (this.tileWidth / 2);
			const worldY = (position.column + position.row) * (this.tileHeight / 2);

			const offsetY = (tile.layer + 1) * (this.tileHeight / 2);

			const adjustedWorldY = worldY - offsetY;

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

		/*
		 * Submit one deferred render command for each tile.
		 *
		 * GridPosition is passed directly to the RenderQueue and remains the
		 * sole source of global rendering order.
		 */
		for (const entity of entities) {
			const position = this.ecs.getComponent(entity, GridPosition);
			const tile = this.ecs.getComponent(entity, Tile);
			if (!position || !tile) {
				continue;
			}

			const region = this.loader.get(tile.id);

			const worldX = (position.column - position.row) * (this.tileWidth / 2);
			const worldY = (position.column + position.row) * (this.tileHeight / 2);

			const offsetY = (tile.layer + 1) * (this.tileHeight / 2);

			const screenPosition = this.camera.worldToScreen(worldX, worldY - offsetY);

			const destinationWidth = region.width * this.camera.scale;
			const destinationHeight = region.height * this.camera.scale;

			this.renderQueue.submit({
				row: position.row,
				column: position.column,
				order: this.tileOrder,

				execute: () => {
					context.drawImage(
						region.texture.image,
						region.x,
						region.y,
						region.width,
						region.height,
						screenPosition.x,
						screenPosition.y,
						destinationWidth,
						destinationHeight,
					);
				},
			});
		}
	}
}
