/**
 * File: RenderWalkHintSystem.ts
 * Path: src/game/systems/
 */

import type { Camera } from "e@camera/Camera.js";
import type { Canvas } from "e@canvas/Canvas.js";
import type { RenderQueue } from "e@render/RenderQueue.js";
import { System } from "e@ecs/System.js";
import type { WalkHintEffectConfig } from "g@config/MovementConfig.js";
import type { WalkHintState } from "g@interaction/WalkHintState.js";
import type { IsometricProjection } from "g@render/IsometricProjection.js";
import type { MovementRangeState } from "g@navigation/MovementRangeState.js";

/**
 * Renders the player's currently reachable movement range.
 *
 * Every reachable tile receives a subtle base highlight. A stronger animated
 * highlight travels outward according to the minimum movement cost required
 * to reach each tile.
 *
 * The renderer consumes precomputed navigation and animation state only. It
 * does not perform pathfinding or modify gameplay state.
 */
export class RenderWalkHintSystem extends System {
	/**
	 * Main rendering canvas.
	 */
	private readonly canvas: Canvas;

	/**
	 * World camera used to project hint geometry into screen space.
	 */
	private readonly camera: Camera;

	/**
	 * Shared render queue used to preserve logical isometric ordering.
	 */
	private readonly renderQueue: RenderQueue;

	/**
	 * Isometric projection describing tile geometry.
	 */
	private readonly projection: IsometricProjection;

	/**
	 * Current reachable movement range.
	 */
	private readonly range: MovementRangeState;

	/**
	 * Current temporal state of the expanding cost wave.
	 */
	private readonly hint: WalkHintState;

	/**
	 * Visual configuration for movement-range hints.
	 */
	private readonly config: WalkHintEffectConfig;

	/**
	 * Creates the movement-range hint renderer.
	 *
	 * @param canvas - Main rendering canvas.
	 * @param camera - World camera.
	 * @param renderQueue - Shared logical render queue.
	 * @param projection - Isometric grid projection.
	 * @param range - Shared reachable movement range.
	 * @param hint - Shared walk hint animation state.
	 * @param config - Walk hint visual configuration.
	 */
	public constructor(
		canvas: Canvas,
		camera: Camera,
		renderQueue: RenderQueue,
		projection: IsometricProjection,
		range: MovementRangeState,
		hint: WalkHintState,
		config: WalkHintEffectConfig,
	) {
		super("render", "required");

		if (
			!Number.isFinite(config.baseOpacity) ||
			config.baseOpacity < 0 ||
			config.baseOpacity > 1
		) {
			throw new RangeError(
				`Walk hint base opacity must be between 0 and 1. Received: ${config.baseOpacity}.`,
			);
		}

		if (
			!Number.isFinite(config.pulseOpacity) ||
			config.pulseOpacity < 0 ||
			config.pulseOpacity > 1
		) {
			throw new RangeError(
				`Walk hint pulse opacity must be between 0 and 1. Received: ${config.pulseOpacity}.`,
			);
		}

		if (!Number.isFinite(config.pulseWidth) || config.pulseWidth <= 0) {
			throw new RangeError(
				`Walk hint pulse width must be greater than zero. Received: ${config.pulseWidth}.`,
			);
		}

		this.canvas = canvas;
		this.camera = camera;
		this.renderQueue = renderQueue;
		this.projection = projection;
		this.range = range;
		this.hint = hint;
		this.config = config;
	}

	/**
	 * Queues movement-range hint rendering for every currently reachable cell.
	 */
	public override render(): void {
		if (!this.range.active || this.range.nodes.length === 0) {
			return;
		}

		for (const node of this.range.nodes) {
			const opacity = this.getOpacity(node.cost);

			if (opacity <= 0) {
				continue;
			}

			this.renderQueue.submit({
				row: node.row,
				column: node.column,
				order: 2,
				execute: () => {
					this.drawDiamond(node.row, node.column, opacity);
				},
			});
		}
	}

	/**
	 * Calculates the final opacity for a reachable tile.
	 *
	 * Every cell receives the configured base opacity. Additional pulse
	 * intensity is determined by the distance between the tile's movement cost
	 * and the current continuous wave position.
	 *
	 * @param cost - Minimum movement cost required to reach the tile.
	 *
	 * @returns Final clamped opacity for the tile.
	 */
	private getOpacity(cost: number): number {
		const distance = Math.abs(cost - this.hint.pulseCost);
		const normalizedDistance = Math.min(distance / this.config.pulseWidth, 1);
		const pulseStrength = 1 - normalizedDistance;

		return Math.min(1, this.config.baseOpacity + this.config.pulseOpacity * pulseStrength);
	}

	/**
	 * Draws a filled isometric diamond over a logical grid cell.
	 *
	 * The hint is aligned with the visual position of a layer-zero map tile.
	 *
	 * @param row - Logical grid row.
	 * @param column - Logical grid column.
	 * @param opacity - Final fill opacity.
	 */
	private drawDiamond(row: number, column: number, opacity: number): void {
		const context = this.canvas.context2D;

		const worldPosition = this.projection.toWorld(row, column);

		const screenPosition = this.camera.worldToScreen(worldPosition.x, worldPosition.y);

		const width = this.projection.width * this.camera.scale;
		const height = this.projection.height * this.camera.scale;

		const halfWidth = width / 2;
		const halfHeight = height / 2;

		context.save();

		context.fillStyle = this.config.color;
		context.globalAlpha = opacity;

		context.beginPath();

		context.moveTo(screenPosition.x + halfWidth, screenPosition.y);
		context.lineTo(screenPosition.x + width, screenPosition.y + halfHeight);
		context.lineTo(screenPosition.x + halfWidth, screenPosition.y + height);
		context.lineTo(screenPosition.x, screenPosition.y + halfHeight);

		context.closePath();
		context.fill();

		context.restore();
	}
}
