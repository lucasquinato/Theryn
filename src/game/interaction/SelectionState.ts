/**
 * File: SelectionState.ts
 * Path: src/game/interaction/
 */

import type { Entity } from "e@ecs/Entity.js";

/**
 * Represents the currently selected destination tile.
 *
 * Selection state stores both the logical navigation destination and the
 * visual animation state associated with its selection highlight.
 *
 * Logical selection remains active until the destination is reached or the
 * selection is explicitly cleared.
 */
export class SelectionState {
	/**
	 * Currently selected tile entity.
	 */
	private selectedEntity: Entity | null = null;

	/**
	 * Logical row of the selected destination tile.
	 */
	private selectedRow: number | null = null;

	/**
	 * Logical column of the selected destination tile.
	 */
	private selectedColumn: number | null = null;

	/**
	 * Normalized progress of the repeating selection pulse.
	 *
	 * Values range from `0` at the beginning of the pulse to `1` at its end.
	 */
	private currentPulseProgress = 0;

	/**
	 * Currently selected tile entity, or `null` when no destination is
	 * selected.
	 */
	public get entity(): Entity | null {
		return this.selectedEntity;
	}

	/**
	 * Logical row of the selected destination tile.
	 */
	public get row(): number | null {
		return this.selectedRow;
	}

	/**
	 * Logical column of the selected destination tile.
	 */
	public get column(): number | null {
		return this.selectedColumn;
	}

	/**
	 * Indicates whether a destination tile is currently selected.
	 */
	public get active(): boolean {
		return this.selectedEntity !== null;
	}

	/**
	 * Normalized progress of the current selection pulse cycle.
	 */
	public get pulseProgress(): number {
		return this.currentPulseProgress;
	}

	/**
	 * Updates the selected destination tile.
	 *
	 * Selecting a new destination restarts the pulse animation from its
	 * beginning.
	 *
	 * @param entity - Selected tile entity.
	 * @param row - Logical destination row.
	 * @param column - Logical destination column.
	 */
	public set(entity: Entity, row: number, column: number): void {
		this.selectedEntity = entity;
		this.selectedRow = row;
		this.selectedColumn = column;
		this.currentPulseProgress = 0;
	}

	/**
	 * Updates the normalized selection pulse progress.
	 *
	 * @param progress - Normalized pulse progress between `0` and `1`.
	 */
	public setPulseProgress(progress: number): void {
		this.currentPulseProgress = Math.min(1, Math.max(0, progress));
	}

	/**
	 * Removes the current tile selection and resets its visual state.
	 */
	public clear(): void {
		this.selectedEntity = null;
		this.selectedRow = null;
		this.selectedColumn = null;
		this.currentPulseProgress = 0;
	}
}
