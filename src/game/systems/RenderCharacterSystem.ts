/**
 * File: RenderCharacterSystem.ts
 * Path: src/game/systems/
 */

import { System } from "e@ecs/System.js";

import { Animator } from "g@components/Animator.js";
import { GridPosition } from "g@components/GridPosition.js";
import { Sprite } from "g@components/Sprite.js";
import { WorldPosition } from "g@components/WorldPosition.js";

import type { Camera } from "e@camera/Camera.js";
import type { Canvas } from "e@canvas/Canvas.js";
import type { ECSManager } from "e@ecs/ECSManager.js";
import type { LoaderManager } from "e@loader/LoaderManager.js";
import type { RenderQueue } from "e@render/RenderQueue.js";

/**
 * Renders animated character entities using their continuous world-space
 * position while preserving logical grid ordering.
 *
 * WorldPosition determines where the sprite is visually drawn. GridPosition
 * remains responsible for RenderQueue ordering so smooth interpolation never
 * replaces the entity's logical grid ownership.
 *
 * Animation frame selection is resolved from the static TextureAnimation
 * metadata provided by the loader and the current frame index stored in the
 * Animator component.
 */
export class RenderCharacterSystem extends System {
	/**
	 * Shared ECS runtime containing character entities.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Resource loader used to resolve character animation metadata.
	 */
	private readonly loader: LoaderManager;

	/**
	 * Canvas receiving character drawing operations.
	 */
	private readonly canvas: Canvas;

	/**
	 * Camera used to transform world-space positions into screen-space.
	 */
	private readonly camera: Camera;

	/**
	 * Shared render queue receiving deferred character drawing commands.
	 */
	private readonly renderQueue: RenderQueue;

	/**
	 * Creates the required character rendering system.
	 *
	 * @param ecs - Shared ECS runtime containing character entities.
	 * @param loader - Resource loader used to resolve character animations.
	 * @param canvas - Canvas used to render characters.
	 * @param camera - Shared camera used for world-to-screen transformation.
	 * @param renderQueue - Shared deferred rendering queue.
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
	 * Submits every animated character to the shared render queue.
	 *
	 * Character drawing uses WorldPosition for smooth visual placement while
	 * GridPosition continues to define deterministic grid-based render order.
	 */
	public override render(): void {
		const context = this.canvas.context2D;

		const entities = this.ecs.query(GridPosition, WorldPosition, Sprite, Animator);

		for (const entity of entities) {
			const gridPosition = this.ecs.getComponent(entity, GridPosition)!;
			const worldPosition = this.ecs.getComponent(entity, WorldPosition)!;
			const sprite = this.ecs.getComponent(entity, Sprite)!;
			const animator = this.ecs.getComponent(entity, Animator)!;

			const animation = this.loader.getAnimation(
				sprite.textureKey,
				animator.animationName,
				animator.sequenceName,
			);

			const sourceX = (animation.fromColumn + animator.frameIndex) * animation.frameWidth;
			const sourceY = animation.row * animation.frameHeight;

			const screenPosition = this.camera.worldToScreen(worldPosition.x, worldPosition.y);

			const destinationWidth = animation.frameWidth * this.camera.scale;
			const destinationHeight = animation.frameHeight * this.camera.scale;

			/**
			 * WorldPosition represents the character's ground anchor.
			 * The sprite is centered horizontally and extends upward from that
			 * anchor.
			 *
			 * Sprite offsets remain visual-only and are scaled together with the
			 * rest of the world.
			 */
			const destinationX =
				screenPosition.x - destinationWidth / 2 + sprite.offsetX * this.camera.scale;
			const destinationY =
				screenPosition.y - destinationHeight + sprite.offsetY * this.camera.scale;

			this.renderQueue.submit({
				row: gridPosition.row,
				column: gridPosition.column,
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
