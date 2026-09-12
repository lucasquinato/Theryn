/**
 * File: RenderCharacterSystem.ts
 * Path: src/game/systems/
 */

import { System } from "e@ecs/System.js";

import type { Camera } from "e@camera/Camera.js";
import type { Canvas } from "e@canvas/Canvas.js";
import type { ECSManager } from "e@ecs/ECSManager.js";
import type { LoaderManager } from "e@loader/LoaderManager.js";
import type { RenderQueue } from "e@render/RenderQueue.js";

import { Animator } from "g@components/Animator.js";
import { GridPosition } from "g@components/GridPosition.js";
import { Sprite } from "g@components/Sprite.js";

import type { IsometricProjection } from "g@render/IsometricProjection.js";

/**
 * Renders animated character entities using the shared isometric projection.
 *
 * The system queries entities containing GridPosition, Sprite, and Animator
 * components, resolves the currently active animation frame, transforms the
 * entity's logical grid position into screen space, and submits a deferred
 * drawing operation to the shared RenderQueue.
 *
 * Characters use the center of their logical grid cell as their world anchor.
 * Their sprite is drawn horizontally centered on that anchor and vertically
 * aligned by its bottom edge so the character's feet remain attached to the
 * logical cell position.
 *
 * Rendering order remains entirely grid-based. Sprite dimensions, animation
 * frame dimensions, and screen-space coordinates never participate in the
 * RenderQueue ordering contract.
 */
export class RenderCharacterSystem extends System {
	/**
	 * Shared ECS runtime containing renderable character entities.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Resource loader used to resolve animation metadata.
	 */
	private readonly loader: LoaderManager;

	/**
	 * Canvas receiving the final character drawing operations.
	 */
	private readonly canvas: Canvas;

	/**
	 * Camera used to transform character world coordinates into screen space.
	 */
	private readonly camera: Camera;

	/**
	 * Shared render queue receiving deferred character drawing commands.
	 */
	private readonly renderQueue: RenderQueue;

	/**
	 * Shared isometric projection used to convert grid coordinates into world
	 * coordinates.
	 */
	private readonly projection: IsometricProjection;

	/**
	 * Creates the required character rendering system.
	 *
	 * @param ecs - Shared ECS runtime containing character entities.
	 * @param loader - Resource loader used to resolve animation metadata.
	 * @param canvas - Canvas used to render characters.
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
	 * Resolves and submits the current animation frame for every renderable
	 * character entity.
	 *
	 * Actual drawing is deferred until the RenderQueue is flushed by the frame
	 * coordinator.
	 */
	public override render(): void {
		const context = this.canvas.context2D;

		const entities = this.ecs.query(GridPosition, Sprite, Animator);

		for (const entity of entities) {
			const position = this.ecs.getComponent(entity, GridPosition);
			const sprite = this.ecs.getComponent(entity, Sprite);
			const animator = this.ecs.getComponent(entity, Animator);
			if (!position || !sprite || !animator) {
				continue;
			}

			const animation = this.loader.getAnimation(
				sprite.textureKey,
				animator.animationName,
				animator.sequenceName,
			);

			/*
			 * Animator frame indices are expected to remain inside the resolved
			 * sequence. AnimationSystem maintains this invariant while playback
			 * is active.
			 */
			const frameColumn = animation.fromColumn + animator.frameIndex;

			const sourceX = frameColumn * animation.frameWidth;
			const sourceY = animation.row * animation.frameHeight;

			const worldPosition = this.projection.toWorldCenter(position.row, position.column);

			const screenPosition = this.camera.worldToScreen(worldPosition.x, worldPosition.y);

			const destinationWidth = animation.frameWidth * this.camera.scale;
			const destinationHeight = animation.frameHeight * this.camera.scale;

			/*
			 * The world position represents the center of the logical cell.
			 *
			 * Character sprites are anchored by their bottom center so their
			 * feet remain attached to that position regardless of frame size.
			 */
			const destinationX =
				screenPosition.x - destinationWidth / 2 + sprite.offsetX * this.camera.scale;

			const destinationY =
				screenPosition.y - destinationHeight + sprite.offsetY * this.camera.scale;

			this.renderQueue.submit({
				row: position.row,
				column: position.column,
				order: sprite.order,

				execute: () => {
					context.drawImage(
						animation.texture.image,
						sourceX,
						sourceY,
						animation.frameWidth,
						animation.frameHeight,
						destinationX,
						destinationY,
						destinationWidth,
						destinationHeight,
					);
				},
			});
		}
	}
}
