/**
 * File: AnimationSystem.ts
 * Path: src/game/systems/
 */

import { System } from "e@ecs/System.js";

import type { ECSManager } from "e@ecs/ECSManager.js";
import type { LoaderManager } from "e@loader/LoaderManager.js";

import { Animator } from "g@components/Animator.js";
import { Sprite } from "g@components/Sprite.js";

/**
 * Advances playback state for animated entities.
 *
 * The system queries entities containing both Sprite and Animator components,
 * resolves their animation metadata through the shared loader, and advances
 * the current animation frame according to elapsed time and the animation's
 * configured frames-per-second rate.
 *
 * TextureAnimation remains responsible only for static animation metadata.
 * Per-entity playback state such as elapsed time, current frame, and playback
 * status remains stored in Animator.
 *
 * Animations currently loop continuously. Additional playback modes should
 * only be introduced when gameplay requires them.
 */
export class AnimationSystem extends System {
	/**
	 * Shared ECS runtime containing animated entities.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Resource loader used to resolve animation metadata.
	 */
	private readonly loader: LoaderManager;

	/**
	 * Creates the required animation update system.
	 *
	 * @param ecs - Shared ECS runtime containing animated entities.
	 * @param loader - Resource loader used to resolve animation sequences.
	 */
	public constructor(ecs: ECSManager, loader: LoaderManager) {
		super("update", "required");

		this.ecs = ecs;
		this.loader = loader;
	}

	/**
	 * Advances every active animator according to the elapsed frame time.
	 *
	 * Large delta times may advance multiple animation frames in a single
	 * update. Remaining fractional frame time is preserved so playback does
	 * not lose timing precision between updates.
	 *
	 * @param deltaTime - Elapsed time since the previous frame in seconds.
	 */
	public override update(deltaTime: number): void {
		const entities = this.ecs.query(Sprite, Animator);

		for (const entity of entities) {
			const sprite = this.ecs.getComponent(entity, Sprite);
			const animator = this.ecs.getComponent(entity, Animator);
			if (!sprite || !animator) {
				continue;
			}

			if (!animator.playing) {
				continue;
			}

			const animation = this.loader.getAnimation(
				sprite.textureKey,
				animator.animationName,
				animator.sequenceName,
			);

			/*
			 * Loader validation guarantees a valid positive FPS value for
			 * resolved animations.
			 */
			const frameDuration = 1 / animation.fps;

			animator.elapsedTime += deltaTime;
			if (animator.elapsedTime < frameDuration) {
				continue;
			}

			/*
			 * Calculate the number of complete animation frames represented by
			 * the accumulated time instead of advancing one frame per update.
			 *
			 * This keeps animation playback stable when an individual engine
			 * frame takes longer than the animation frame duration.
			 */
			const framesToAdvance = Math.floor(animator.elapsedTime / frameDuration);

			animator.elapsedTime %= frameDuration;

			animator.frameIndex = (animator.frameIndex + framesToAdvance) % animation.frameCount;
		}
	}
}
