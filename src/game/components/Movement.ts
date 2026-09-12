/**
 * File: Movement.ts
 * Path: src/game/components/
 */

import type { GridPathNode } from "g@navigation/GridPathfinder.js";

/**
 * Direction names supported by the current character animation set.
 */
export type MovementDirection = "rightDown" | "leftDown" | "rightTop" | "leftTop";

/**
 * Stores the current grid movement state of an entity.
 *
 * Movement contains path progression and directional state only. It does not
 * perform interpolation, modify positions, or control animations directly.
 *
 * GridPosition remains responsible for logical occupancy while WorldPosition
 * is updated independently by the movement system for smooth visual motion.
 */
export class Movement {
	/**
	 * Current navigation path.
	 *
	 * The path excludes the entity's starting cell. Each node therefore
	 * represents a grid cell that must still be reached.
	 */
	private currentPath: readonly GridPathNode[] = [];

	/**
	 * Logical grid position where the current path originally started.
	 */
	private pathStart: GridPathNode | null = null;

	/**
	 * Index of the path node currently being approached.
	 */
	private currentPathIndex = 0;

	/**
	 * Normalized progress through the current movement segment.
	 *
	 * `0` represents the segment origin and `1` represents the next grid cell
	 * center.
	 */
	private currentProgress = 0;

	/**
	 * Indicates whether the entity is currently traversing a path.
	 */
	private moving = false;

	/**
	 * Last directional orientation used by the entity.
	 *
	 * This value is preserved after movement ends so the character can remain
	 * idle while facing the direction of its final movement segment.
	 */
	private currentDirection: MovementDirection = "rightDown";

	/**
	 * Current navigation path.
	 */
	public get path(): readonly GridPathNode[] {
		return this.currentPath;
	}

	/**
	 * Index of the path node currently being approached.
	 */
	public get pathIndex(): number {
		return this.currentPathIndex;
	}

	/**
	 * Current normalized movement progress within the active segment.
	 */
	public get progress(): number {
		return this.currentProgress;
	}

	/**
	 * Indicates whether this entity is currently moving.
	 */
	public get active(): boolean {
		return this.moving;
	}

	/**
	 * Current or most recently used movement direction.
	 */
	public get direction(): MovementDirection {
		return this.currentDirection;
	}

	/**
	 * Current path node being approached.
	 */
	public get target(): GridPathNode | null {
		if (!this.moving) {
			return null;
		}

		return this.currentPath[this.currentPathIndex] ?? null;
	}

	/**
	 * Logical origin of the currently active movement segment.
	 *
	 * The first segment originates from the grid position supplied when the
	 * path starts. Subsequent segments originate from the previous path node.
	 */
	public get origin(): GridPathNode | null {
		if (!this.moving || this.pathStart === null) {
			return null;
		}

		if (this.currentPathIndex === 0) {
			return this.pathStart;
		}

		return this.currentPath[this.currentPathIndex - 1] ?? null;
	}

	/**
	 * Starts movement along a navigation path.
	 *
	 * The path is expected to exclude the entity's current grid position.
	 *
	 * @param path - Ordered grid cells that must be reached.
	 * @param startRow - Logical row where the path begins.
	 * @param startColumn - Logical column where the path begins.
	 */
	public start(path: readonly GridPathNode[], startRow: number, startColumn: number): void {
		if (path.length === 0) {
			this.stop();
			return;
		}

		this.currentPath = path;

		this.pathStart = {
			row: startRow,
			column: startColumn,
		};

		this.currentPathIndex = 0;
		this.currentProgress = 0;
		this.moving = true;
	}

	/**
	 * Updates normalized progress through the current path segment.
	 *
	 * @param progress - Normalized segment progress.
	 */
	public setProgress(progress: number): void {
		this.currentProgress = progress;
	}

	/**
	 * Updates the current movement direction.
	 *
	 * @param direction - Direction corresponding to the active path segment.
	 */
	public setDirection(direction: MovementDirection): void {
		this.currentDirection = direction;
	}

	/**
	 * Advances movement to the next path node.
	 *
	 * Segment progress is reset to zero. When the final node has already been
	 * reached, the movement state becomes inactive.
	 */
	public advance(): void {
		const nextIndex = this.currentPathIndex + 1;

		if (nextIndex >= this.currentPath.length) {
			this.stop();
			return;
		}

		this.currentPathIndex = nextIndex;

		this.currentProgress = 0;
	}

	/**
	 * Stops the current movement while preserving the last facing direction.
	 */
	public stop(): void {
		this.currentPath = [];
		this.pathStart = null;
		this.currentPathIndex = 0;
		this.currentProgress = 0;
		this.moving = false;
	}
}
