/**
 * File: InputManager.ts
 * Path: src/engine/input/
 */

import { MouseInput } from "e@input/mouse/MouseInput.js";

/**
 * Central input subsystem responsible for managing the input devices
 * available to the engine.
 *
 * The manager acts as the stable public entry point for input access.
 * Individual input sources remain responsible for collecting and exposing
 * their own device-specific state.
 *
 * Mouse input is currently the only implemented input source. Keyboard and
 * touch input may be added later without changing the public ownership model.
 */
export class InputManager {
	/**
	 * Mouse input associated with the primary interaction canvas.
	 */
	public readonly mouse: MouseInput;

	/**
	 * Creates the input manager.
	 *
	 * @param canvas - Canvas used as the current mouse interaction surface.
	 */
	public constructor(canvas: HTMLCanvasElement) {
		this.mouse = new MouseInput(canvas);
	}

	/**
	 * Finalizes the current input frame.
	 *
	 * Device-specific transient state is cleared only after all consumers have
	 * had an opportunity to inspect the input collected during the frame.
	 *
	 * Persistent state such as mouse position and held buttons remains intact.
	 */
	public endFrame(): void {
		this.mouse.endFrame();
	}
}
