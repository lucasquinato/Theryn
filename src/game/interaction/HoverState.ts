/**
 * File: HoverState.ts
 * Path: src/game/interaction/
 */

import type { Entity } from "e@ecs/Entity.js";

/**
 * Represents the current tile hover state.
 *
 * Hover selection is calculated by gameplay systems and shared with render
 * systems through this state object. Only interactive map tiles are stored.
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
	 * Indicates whether an eligible tile is currently hovered.
	 */
	public get active(): boolean {
		return this.hoveredEntity !== null;
	}

	/**
	 * Updates the currently hovered tile.
	 *
	 * @param entity - Hovered tile entity.
	 * @param row - Logical tile row.
	 * @param column - Logical tile column.
	 */
	public set(entity: Entity, row: number, column: number): void {
		this.hoveredEntity = entity;
		this.hoveredRow = row;
		this.hoveredColumn = column;
	}

	/**
	 * Removes the current hover selection.
	 */
	public clear(): void {
		this.hoveredEntity = null;
		this.hoveredRow = null;
		this.hoveredColumn = null;
	}
}
