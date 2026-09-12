/**
 * File: RenderQueue.ts
 * Path: src/engine/render/
 */

import type { RenderCommand } from "e@render/RenderCommand.js";

/**
 * Internal render queue entry.
 *
 * The submission index provides deterministic ordering when two commands share
 * the same grid position and local order.
 */
interface RenderQueueEntry {
	/**
	 * Render command submitted by a rendering system.
	 */
	readonly command: RenderCommand;

	/**
	 * Sequential index assigned when the command enters the queue.
	 */
	readonly submissionIndex: number;
}

/**
 * Collects deferred rendering operations and executes them using deterministic
 * grid-based ordering.
 *
 * The queue follows the logical isometric grid traversal used by the engine:
 *
 * - Lower row + column diagonals render first.
 * - Within the same diagonal, higher rows render first.
 * - Commands occupying the same grid position are ordered by their local
 *   order value.
 * - Commands still tied after those criteria preserve submission order.
 *
 * Rendering order is intentionally independent from texture dimensions,
 * screen-space coordinates, map layers, and visual depth calculations.
 */
export class RenderQueue {
	/**
	 * Commands waiting to be rendered during the current frame.
	 */
	private readonly entries: RenderQueueEntry[] = [];

	/**
	 * Sequential index assigned to the next submitted command.
	 */
	private nextSubmissionIndex = 0;

	/**
	 * Submits a deferred rendering command to the current frame.
	 *
	 * Submission does not immediately execute the command. The operation remains
	 * queued until flush() is called.
	 *
	 * @param command - Render command to enqueue.
	 */
	public submit(command: RenderCommand): void {
		this.entries.push({
			command,
			submissionIndex: this.nextSubmissionIndex++,
		});
	}

	/**
	 * Executes all queued commands using deterministic grid-based ordering.
	 *
	 * Commands are sorted using the following precedence:
	 *
	 * 1. row + column ascending.
	 * 2. row descending within the same diagonal.
	 * 3. order ascending when both commands occupy the same grid position.
	 * 4. submission order when every previous criterion is identical.
	 *
	 * The queue is cleared after execution.
	 */
	public flush(): void {
		this.entries.sort((a, b) => this.compareEntries(a, b));

		for (const entry of this.entries) {
			entry.command.execute();
		}

		this.clear();
	}

	/**
	 * Removes all commands currently waiting in the queue.
	 *
	 * The submission sequence is reset so each frame begins from a clean,
	 * deterministic state.
	 */
	public clear(): void {
		this.entries.length = 0;
		this.nextSubmissionIndex = 0;
	}

	/**
	 * Compares two render queue entries according to the engine's grid-based
	 * rendering contract.
	 *
	 * Local order is evaluated only after both row and column are identical,
	 * preventing it from affecting commands that belong to different cells.
	 *
	 * @param a - First queue entry.
	 * @param b - Second queue entry.
	 *
	 * @returns A negative value when a must render first, a positive value when
	 * b must render first, or zero when both entries are equivalent.
	 */
	private compareEntries(a: RenderQueueEntry, b: RenderQueueEntry): number {
		const commandA = a.command;
		const commandB = b.command;

		const diagonalA = commandA.row + commandA.column;

		const diagonalB = commandB.row + commandB.column;

		if (diagonalA !== diagonalB) {
			return diagonalA - diagonalB;
		}

		if (commandA.row !== commandB.row) {
			return commandB.row - commandA.row;
		}

		if (
			commandA.row === commandB.row &&
			commandA.column === commandB.column &&
			commandA.order !== commandB.order
		) {
			return commandA.order - commandB.order;
		}

		return a.submissionIndex - b.submissionIndex;
	}
}
