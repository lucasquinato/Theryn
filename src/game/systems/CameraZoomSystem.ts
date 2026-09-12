/**
 * File: CameraZoomSystem.ts
 * Path: src/game/systems/
 */

import type { Camera } from "e@camera/Camera.js";
import { System } from "e@ecs/System.js";
import type { MouseInput } from "e@input/mouse/MouseInput.js";

/**
 * Controls camera zoom through vertical mouse wheel input.
 *
 * Wheel direction determines whether the camera zooms in or out. The zoom
 * level is constrained to the configured minimum and maximum values.
 *
 * The raw wheel magnitude is intentionally ignored because browsers and input
 * devices may report substantially different delta values for the same user
 * gesture. Only the wheel direction affects the zoom step.
 */
export class CameraZoomSystem extends System {
	/**
	 * Mouse input source providing wheel movement.
	 */
	private readonly mouse: MouseInput;

	/**
	 * Camera whose zoom level is controlled by this system.
	 */
	private readonly camera: Camera;

	/**
	 * Minimum allowed camera zoom multiplier.
	 */
	private readonly minimumZoom = 1;

	/**
	 * Maximum allowed camera zoom multiplier.
	 */
	private readonly maximumZoom = 5;

	/**
	 * Zoom amount applied for each detected wheel direction change.
	 */
	private readonly zoomStep = 0.25;

	/**
	 * Creates the camera zoom system.
	 *
	 * @param mouse - Mouse input source.
	 * @param camera - Shared camera whose zoom level will be modified.
	 */
	public constructor(mouse: MouseInput, camera: Camera) {
		super("update", "required");

		this.mouse = mouse;
		this.camera = camera;
	}

	/**
	 * Applies mouse wheel input to the camera zoom.
	 */
	public override update(): void {
		const wheelY = this.mouse.wheel.y;

		if (wheelY === 0) {
			return;
		}

		const direction = wheelY < 0 ? 1 : -1;

		const nextZoom = this.clamp(
			this.camera.scale + direction * this.zoomStep,
			this.minimumZoom,
			this.maximumZoom,
		);

		if (nextZoom === this.camera.scale) {
			return;
		}

		this.camera.setZoom(nextZoom);
	}

	/**
	 * Constrains a numeric value to an inclusive range.
	 *
	 * @param value - Value to constrain.
	 * @param minimum - Inclusive minimum.
	 * @param maximum - Inclusive maximum.
	 *
	 * @returns The constrained value.
	 */
	private clamp(value: number, minimum: number, maximum: number): number {
		return Math.min(maximum, Math.max(minimum, value));
	}
}
