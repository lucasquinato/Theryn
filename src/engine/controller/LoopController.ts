/**
 * File: LoopController.ts
 * Path: src/engine/loop/
 */

/**
 * Callback executed once per engine frame.
 *
 * @param deltaTime - Time elapsed since the previous frame, in seconds.
 */
export type LoopCallback = (deltaTime: number) => void;

/**
 * Controls the main engine execution loop.
 *
 * The LoopController is responsible only for scheduling frames through
 * requestAnimationFrame() and calculating the elapsed time between frames.
 *
 * Game state, scene transitions, simulation, and rendering logic remain
 * external and are executed through the callback supplied to start().
 */
export class LoopController {
	/**
	 * Identifier of the currently scheduled animation frame.
	 *
	 * The value remains null while no frame request is pending.
	 */
	private frameRequestID: number | null = null;

	/**
	 * Timestamp of the previously processed frame in milliseconds.
	 *
	 * Used to calculate the delta time passed to the loop callback.
	 */
	private previousTime: number = 0;

	/**
	 * Indicates whether the execution loop is currently active.
	 *
	 * This state prevents duplicate loops from being started and allows
	 * scheduled callbacks to stop execution safely.
	 */
	private running: boolean = false;

	/**
	 * Starts the main execution loop.
	 *
	 * The callback is executed once per animation frame and receives the
	 * elapsed time since the previous frame expressed in seconds.
	 *
	 * Calling start() while the loop is already running has no effect,
	 * preventing multiple requestAnimationFrame chains from being created.
	 *
	 * @param callback - Function executed once per engine frame.
	 */
	public start(callback: LoopCallback): void {
		if (this.running) {
			return;
		}

		this.running = true;
		this.previousTime = performance.now();

		const frame = (currentTime: number): void => {
			if (!this.running) {
				return;
			}

			const deltaTime = (currentTime - this.previousTime) / 1000;

			this.previousTime = currentTime;

			callback(deltaTime);

			this.frameRequestID = requestAnimationFrame(frame);
		};

		this.frameRequestID = requestAnimationFrame(frame);
	}

	/**
	 * Stops the main execution loop.
	 *
	 * Any pending animation frame request is cancelled and the internal
	 * running state is reset.
	 *
	 * Calling stop() while the loop is already stopped has no effect.
	 */
	public stop(): void {
		if (!this.running) {
			return;
		}

		this.running = false;

		if (this.frameRequestID !== null) {
			cancelAnimationFrame(this.frameRequestID);
			this.frameRequestID = null;
		}
	}
}
