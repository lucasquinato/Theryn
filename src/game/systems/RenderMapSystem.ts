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

import type { IsometricProjection } from "g@render/IsometricProjection.js";

/**
 * Renders map tile entities using the shared isometric projection.
 *
 * The system queries entities containing GridPosition and Tile components,
 * projects their logical grid coordinates into world space, transforms those
 * coordinates through the camera, and submits deferred drawing operations to
 * the shared RenderQueue.
 *
 * Tile rendering order is determined exclusively by GridPosition through the
 * RenderQueue. Map layers and visual texture dimensions do not participate in
 * global render ordering.
 *
 * Camera position and zoom are intentionally controlled outside this system.
 * The map renderer consumes the current camera state without modifying it.
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
	 * Camera used to transform tile world coordinates into screen space.
	 */
	private readonly camera: Camera;

	/**
	 * Shared render queue receiving deferred tile drawing commands.
	 */
	private readonly renderQueue: RenderQueue;

	/**
	 * Shared isometric projection used to convert grid coordinates into world
	 * coordinates.
	 */
	private readonly projection: IsometricProjection;

	/**
	 * Local render order assigned to map tiles.
	 *
	 * The value only participates in ordering when another command occupies the
	 * exact same logical grid position.
	 */
	private readonly tileOrder = 0;

	/**
	 * Creates the required map rendering system.
	 *
	 * @param ecs - Shared ECS runtime containing map entities.
	 * @param loader - Resource loader used to resolve tile textures.
	 * @param canvas - Canvas used to render the map.
	 * @param camera - Shared camera used for world-to-screen transformation.
	 * @param renderQueue - Shared queue used for grid-based render ordering.
	 * @param projection - Shared isometric grid projection.
	 */
	public constructor(
		ecs: ECSManager,
		loader: LoaderManager,
		canvas: Canvas,
		camera: Camera,
		renderQueue: RenderQueue,
		projection: IsometricProjection,
	) {
		super("render", "required");

		this.ecs = ecs;
		this.loader = loader;
		this.canvas = canvas;
		this.camera = camera;
		this.renderQueue = renderQueue;
		this.projection = projection;
	}

	/**
	 * Submits every map tile to the shared render queue.
	 *
	 * Actual drawing is deferred until the RenderQueue is flushed by the frame
	 * coordinator.
	 */
	public override render(): void {
		const context = this.canvas.context2D;
		const canvas = this.canvas.element;

		/*
		 * Frame clearing remains temporarily owned by the map renderer until a
		 * dedicated frame-level canvas coordinator becomes necessary.
		 */
		context.clearRect(0, 0, canvas.width, canvas.height);

		/*
		 * The viewport depends on the current logical canvas buffer dimensions
		 * and must remain synchronized with responsive canvas resizing.
		 */
		this.camera.setViewport(canvas.width, canvas.height);

		const entities = this.ecs.query(GridPosition, Tile);

		for (const entity of entities) {
			const position = this.ecs.getComponent(entity, GridPosition);
			const tile = this.ecs.getComponent(entity, Tile);
			if (!position || !tile) {
				continue;
			}

			const region = this.loader.get(tile.id);

			const worldPosition = this.projection.toWorld(position.row, position.column);

			/*
			 * Map layers currently modify only the tile's visual vertical
			 * position. They never participate in RenderQueue ordering.
			 */
			const layerOffsetY = this.projection.getLayerOffsetY(tile.layer);

			const screenPosition = this.camera.worldToScreen(
				worldPosition.x,
				worldPosition.y - layerOffsetY,
			);

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
