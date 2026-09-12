/**
 * File: RenderCommand.ts
 * Path: src/engine/render/
 */

/**
 * Represents a deferred rendering operation submitted to the RenderQueue.
 *
 * Render commands are ordered primarily by their logical grid position.
 * Commands sharing the same grid position may use order as a local tie-breaker.
 *
 * The execute callback contains the actual drawing operation and is invoked
 * only when the RenderQueue flushes the frame.
 */
export interface RenderCommand {
	/**
	 * Logical grid row associated with the rendered entity.
	 */
	readonly row: number;

	/**
	 * Logical grid column associated with the rendered entity.
	 */
	readonly column: number;

	/**
	 * Local ordering value used only when multiple commands occupy the same
	 * grid position.
	 *
	 * This value never allows a command to overtake another command belonging
	 * to a different grid position.
	 */
	readonly order: number;

	/**
	 * Deferred drawing operation executed when the render queue is flushed.
	 */
	readonly execute: () => void;
}
