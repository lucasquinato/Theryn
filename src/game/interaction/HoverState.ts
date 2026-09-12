/**
 * File: HoverState.ts
 * Path: src/game/interaction/
 */

import type { Entity } from "e@ecs/Entity.js";

/**
 * Represents the current and previous interactive tile hover states.
 *
 * The current state identifies the tile that is logically under the mouse
 * pointer. The previous state preserves the tile that was hovered immediately
 * before it, allowing visual effects such as fade-out and vertical movement to
 * complete after logical interaction has already ended.
 *
 * Visual animation values are stored here but updated externally by the
 * hover effect system.
 */
export class HoverState {
	/**
	 * Currently hovered tile entity.
	 */
	private hoveredEntity: Entity | null = null;

	/**
	 * Logical row of the currently hovered tile.
	 */
	private hoveredRow: number | null = null;

	/**
	 * Logical column of the currently hovered tile.
	 */
	private hoveredColumn: number | null = null;

	/**
	 * Current normalized highlight opacity.
	 *
	 * Values are expected to remain between `0` and `1`.
	 */
	private hoveredAlpha = 0;

	/**
	 * Current vertical world-space lift applied to the hovered tile.
	 */
	private hoveredLift = 0;

	/**
	 * Tile entity that was hovered immediately before the current tile.
	 *
	 * This entity remains available only while its exit animation is active.
	 */
	private previousEntity: Entity | null = null;

	/**
	 * Logical row of the previous hovered tile.
	 */
	private previousRow: number | null = null;

	/**
	 * Logical column of the previous hovered tile.
	 */
	private previousColumn: number | null = null;

	/**
	 * Current normalized fade-out opacity of the previous hovered tile.
	 */
	private previousAlpha = 0;

	/**
	 * Current vertical world-space lift of the previous hovered tile.
	 */
	private previousLift = 0;

	/**
	 * Currently hovered tile entity, or `null` when no eligible tile is under
	 * the mouse pointer.
	 */
	public get entity(): Entity | null {
		return this.hoveredEntity;
	}

	/**
	 * Logical row of the currently hovered tile.
	 */
	public get row(): number | null {
		return this.hoveredRow;
	}

	/**
	 * Logical column of the currently hovered tile.
	 */
	public get column(): number | null {
		return this.hoveredColumn;
	}

	/**
	 * Current normalized highlight opacity of the hovered tile.
	 */
	public get alpha(): number {
		return this.hoveredAlpha;
	}

	/**
	 * Current vertical world-space lift of the hovered tile.
	 */
	public get lift(): number {
		return this.hoveredLift;
	}

	/**
	 * Indicates whether an eligible tile is currently hovered.
	 *
	 * This represents logical interaction state and becomes `false`
	 * immediately when the mouse leaves an interactive tile, even if its
	 * visual exit animation is still running.
	 */
	public get active(): boolean {
		return this.hoveredEntity !== null;
	}

	/**
	 * Previous hovered tile entity, or `null` when no exit animation remains.
	 */
	public get previous(): Entity | null {
		return this.previousEntity;
	}

	/**
	 * Logical row of the previous hovered tile.
	 */
	public get previousGridRow(): number | null {
		return this.previousRow;
	}

	/**
	 * Logical column of the previous hovered tile.
	 */
	public get previousGridColumn(): number | null {
		return this.previousColumn;
	}

	/**
	 * Current normalized fade-out opacity of the previous hovered tile.
	 */
	public get previousOpacity(): number {
		return this.previousAlpha;
	}

	/**
	 * Current vertical world-space lift of the previous hovered tile.
	 */
	public get previousOffset(): number {
		return this.previousLift;
	}

	/**
	 * Indicates whether a previous hovered tile is still retained for visual
	 * exit effects.
	 */
	public get previousActive(): boolean {
		return this.previousEntity !== null;
	}

	/**
	 * Changes the currently hovered tile.
	 *
	 * When the hovered entity changes, the existing current tile is transferred
	 * into the previous visual state so its exit animation can continue. The
	 * new tile begins with zero opacity and zero lift.
	 *
	 * Reapplying the same entity does not restart its visual animation.
	 *
	 * @param entity - Hovered tile entity.
	 * @param row - Logical tile row.
	 * @param column - Logical tile column.
	 */
	public set(entity: Entity, row: number, column: number): void {
		if (this.hoveredEntity === entity) {
			this.hoveredRow = row;
			this.hoveredColumn = column;
			return;
		}

		this.transferCurrentToPrevious();

		this.hoveredEntity = entity;
		this.hoveredRow = row;
		this.hoveredColumn = column;

		this.hoveredAlpha = 0;
		this.hoveredLift = 0;
	}

	/**
	 * Removes the current logical hover selection.
	 *
	 * The previously active tile is preserved as the previous visual state so
	 * fade-out and vertical return animations can finish naturally.
	 *
	 * Calling this method while no tile is hovered has no effect.
	 */
	public clear(): void {
		if (this.hoveredEntity === null) {
			return;
		}

		this.transferCurrentToPrevious();

		this.hoveredEntity = null;
		this.hoveredRow = null;
		this.hoveredColumn = null;

		this.hoveredAlpha = 0;
		this.hoveredLift = 0;
	}

	/**
	 * Updates the visual animation values of the currently hovered tile.
	 *
	 * @param alpha - Normalized highlight opacity.
	 * @param lift - Vertical world-space tile lift.
	 */
	public updateCurrentVisual(alpha: number, lift: number): void {
		this.hoveredAlpha = alpha;
		this.hoveredLift = lift;
	}

	/**
	 * Updates the visual animation values of the previous hovered tile.
	 *
	 * @param alpha - Normalized highlight opacity.
	 * @param lift - Vertical world-space tile lift.
	 */
	public updatePreviousVisual(alpha: number, lift: number): void {
		this.previousAlpha = alpha;
		this.previousLift = lift;
	}

	/**
	 * Removes the previous visual state after its exit animation has completed.
	 */
	public clearPrevious(): void {
		this.previousEntity = null;
		this.previousRow = null;
		this.previousColumn = null;

		this.previousAlpha = 0;
		this.previousLift = 0;
	}

	/**
	 * Transfers the current hover state into the previous visual slot.
	 *
	 * The current visual values are preserved so the exit animation continues
	 * smoothly from the exact point reached by the entry animation.
	 */
	private transferCurrentToPrevious(): void {
		if (this.hoveredEntity === null) {
			return;
		}

		this.previousEntity = this.hoveredEntity;
		this.previousRow = this.hoveredRow;
		this.previousColumn = this.hoveredColumn;
		this.previousAlpha = this.hoveredAlpha;
		this.previousLift = this.hoveredLift;
	}
}
