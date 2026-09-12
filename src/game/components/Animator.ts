/**
 * File: Animator.ts
 * Path: src/game/components/
 */

/**
 * Stores runtime animation state for an animated entity.
 *
 * Animation definitions and frame data remain owned by the loader. This
 * component only tracks which animation sequence is active and the current
 * playback state for the entity.
 */
export class Animator {
	/**
	 * Animation group currently selected for playback.
	 */
	public animationName: string;

	/**
	 * Sequence currently selected inside the active animation group.
	 */
	public sequenceName: string;

	/**
	 * Index of the currently active frame inside the resolved sequence.
	 */
	public frameIndex = 0;

	/**
	 * Elapsed playback time accumulated for the current frame, in seconds.
	 */
	public elapsedTime = 0;

	/**
	 * Indicates whether animation playback is currently active.
	 */
	public playing = true;

	/**
	 * Creates an animator component.
	 *
	 * @param animationName - Animation group to use.
	 * @param sequenceName - Sequence to play inside the animation group.
	 *
	 * @throws {Error} If either animation or sequence name is empty.
	 */
	public constructor(animationName: string, sequenceName: string) {
		if (animationName.trim().length === 0) {
			throw new Error("Animator animation name cannot be empty.");
		}

		if (sequenceName.trim().length === 0) {
			throw new Error("Animator sequence name cannot be empty.");
		}

		this.animationName = animationName;
		this.sequenceName = sequenceName;
	}

	/**
	 * Changes the active animation sequence and resets playback state.
	 *
	 * Re-selecting the currently active animation and sequence has no effect.
	 *
	 * @param animationName - Animation group to activate.
	 * @param sequenceName - Sequence to activate inside the animation group.
	 *
	 * @throws {Error} If either animation or sequence name is empty.
	 */
	public play(animationName: string, sequenceName: string): void {
		if (animationName.trim().length === 0) {
			throw new Error("Animator animation name cannot be empty.");
		}

		if (sequenceName.trim().length === 0) {
			throw new Error("Animator sequence name cannot be empty.");
		}

		if (this.animationName === animationName && this.sequenceName === sequenceName) {
			this.playing = true;
			return;
		}

		this.animationName = animationName;
		this.sequenceName = sequenceName;
		this.frameIndex = 0;
		this.elapsedTime = 0;
		this.playing = true;
	}

	/**
	 * Pauses animation playback without changing the current frame.
	 */
	public pause(): void {
		this.playing = false;
	}

	/**
	 * Resumes animation playback from the current frame.
	 */
	public resume(): void {
		this.playing = true;
	}

	/**
	 * Resets animation playback to the first frame while preserving the active
	 * animation and sequence.
	 */
	public reset(): void {
		this.frameIndex = 0;
		this.elapsedTime = 0;
	}
}
