/**
 * File: WalkHintState.ts
 * Path: src/game/interaction/
 */

/**
 * Stores the temporal state of the movement-range hint animation.
 *
 * WalkHintState contains no rendering or navigation logic. It only exposes the
 * current normalized animation progress and its equivalent movement-cost
 * position for consumers such as RenderWalkHintSystem.
 */
export class WalkHintState {
	/**
	 * Normalized animation progress in the range [0, 1).
	 */
	private currentProgress: number = 0;

	/**
	 * Continuous cost position currently reached by the expanding hint wave.
	 */
	private currentPulseCost: number = 0;

	/**
	 * Current normalized animation progress.
	 */
	public get progress(): number {
		return this.currentProgress;
	}

	/**
	 * Current continuous movement-cost position reached by the hint wave.
	 */
	public get pulseCost(): number {
		return this.currentPulseCost;
	}

	/**
	 * Updates the current hint animation state.
	 *
	 * @param progress - Normalized animation progress in the range [0, 1).
	 * @param pulseCost - Continuous movement-cost position reached by the wave.
	 */
	public set(progress: number, pulseCost: number): void {
		this.currentProgress = Math.max(0, Math.min(progress, 1));

		this.currentPulseCost = Math.max(0, pulseCost);
	}

	/**
	 * Resets the hint animation to its initial state.
	 */
	public reset(): void {
		this.currentProgress = 0;
		this.currentPulseCost = 0;
	}
}
