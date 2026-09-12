/**
 * File: MovementRangeState.ts
 * Path: src/game/navigation/
 */

import type { GridCostNode } from "g@navigation/GridCostField.js";

/**
 * Stores the currently reachable movement range around an origin cell.
 *
 * The state contains the minimum movement cost required to reach each
 * available destination and provides efficient lookup helpers for consumers
 * such as selection and movement hint systems.
 */
export class MovementRangeState {
	/**
	 * Reachable movement nodes keyed by logical grid position.
	 */
	private readonly nodesByPosition = new Map<string, GridCostNode>();

	/**
	 * Reachable movement nodes in insertion order.
	 */
	private currentNodes: readonly GridCostNode[] = [];

	/**
	 * Logical row used as the origin of the current movement range.
	 */
	private originRow: number | null = null;

	/**
	 * Logical column used as the origin of the current movement range.
	 */
	private originColumn: number | null = null;

	/**
	 * Current reachable movement nodes.
	 */
	public get nodes(): readonly GridCostNode[] {
		return this.currentNodes;
	}

	/**
	 * Logical row used as the current range origin.
	 */
	public get row(): number | null {
		return this.originRow;
	}

	/**
	 * Logical column used as the current range origin.
	 */
	public get column(): number | null {
		return this.originColumn;
	}

	/**
	 * Indicates whether a movement range has currently been calculated.
	 */
	public get active(): boolean {
		return this.originRow !== null && this.originColumn !== null;
	}

	/**
	 * Replaces the current movement range.
	 *
	 * @param row - Logical origin row.
	 * @param column - Logical origin column.
	 * @param nodes - Reachable cells and their minimum movement costs.
	 */
	public set(row: number, column: number, nodes: readonly GridCostNode[]): void {
		this.originRow = row;
		this.originColumn = column;

		this.currentNodes = nodes;

		this.nodesByPosition.clear();

		for (const node of nodes) {
			this.nodesByPosition.set(this.createKey(node.row, node.column), node);
		}
	}

	/**
	 * Determines whether a logical grid cell belongs to the current movement
	 * range.
	 *
	 * @param row - Logical grid row.
	 * @param column - Logical grid column.
	 *
	 * @returns `true` when the cell is reachable within the active cost budget.
	 */
	public contains(row: number, column: number): boolean {
		return this.nodesByPosition.has(this.createKey(row, column));
	}

	/**
	 * Resolves the minimum movement cost required to reach a grid cell.
	 *
	 * @param row - Logical grid row.
	 * @param column - Logical grid column.
	 *
	 * @returns The minimum movement cost, or `null` when the cell is outside
	 * the current movement range.
	 */
	public getCost(row: number, column: number): number | null {
		const node = this.nodesByPosition.get(this.createKey(row, column));

		return node?.cost ?? null;
	}

	/**
	 * Removes the current movement range.
	 */
	public clear(): void {
		this.originRow = null;
		this.originColumn = null;
		this.currentNodes = [];

		this.nodesByPosition.clear();
	}

	/**
	 * Creates a stable lookup key for a logical grid position.
	 *
	 * @param row - Logical grid row.
	 * @param column - Logical grid column.
	 */
	private createKey(row: number, column: number): string {
		return `${row}:${column}`;
	}
}
