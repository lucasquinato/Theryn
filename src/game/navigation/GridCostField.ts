/**
 * File: GridCostField.ts
 * Path: src/game/navigation/
 */

import type { Entity } from "e@ecs/Entity.js";
import type { GridNavigation } from "g@navigation/GridNavigation.js";

/**
 * Represents a reachable logical grid cell and the minimum accumulated
 * movement cost required to reach it.
 */
export interface GridCostNode {
	/**
	 * Logical grid row.
	 */
	readonly row: number;

	/**
	 * Logical grid column.
	 */
	readonly column: number;

	/**
	 * Minimum accumulated movement cost from the origin.
	 */
	readonly cost: number;
}

/**
 * Internal node used while expanding the movement cost field.
 */
interface CostSearchNode extends GridCostNode {}

/**
 * Calculates reachable grid cells within a movement cost budget.
 *
 * The field is generated using Dijkstra's algorithm so movement costs may vary
 * between tiles without changing the consumer API.
 *
 * Navigation validity and per-cell movement cost are delegated entirely to
 * GridNavigation.
 */
export class GridCostField {
	/**
	 * Shared navigation resolver used to validate cells and resolve movement
	 * costs.
	 */
	private readonly navigation: GridNavigation;

	/**
	 * Creates a grid cost field calculator.
	 *
	 * @param navigation - Shared logical grid navigation resolver.
	 */
	public constructor(navigation: GridNavigation) {
		this.navigation = navigation;
	}

	/**
	 * Calculates every cell reachable from an origin within a maximum cost.
	 *
	 * The origin itself is not included in the returned field because it has
	 * cost zero and does not represent a movement destination.
	 *
	 * The moving entity may be ignored during occupancy checks so its current
	 * cell does not block expansion.
	 *
	 * @param startRow - Logical origin row.
	 * @param startColumn - Logical origin column.
	 * @param movingEntity - Optional entity ignored during occupancy checks.
	 * @param maximumCost - Maximum accumulated movement cost allowed.
	 *
	 * @returns Reachable grid cells with their minimum accumulated cost.
	 */
	public calculate(
		startRow: number,
		startColumn: number,
		movingEntity: Entity | null,
		maximumCost: number,
	): readonly GridCostNode[] {
		if (!Number.isFinite(maximumCost) || maximumCost < 0) {
			throw new RangeError(
				`Maximum movement cost must be a finite non-negative number. Received: ${maximumCost}.`,
			);
		}

		if (maximumCost === 0) {
			return [];
		}

		const startKey = this.createKey(startRow, startColumn);

		const frontier = new Map<string, CostSearchNode>();
		const bestCosts = new Map<string, number>();
		const positions = new Map<string, GridCostNode>();

		frontier.set(startKey, {
			row: startRow,
			column: startColumn,
			cost: 0,
		});

		bestCosts.set(startKey, 0);

		while (frontier.size > 0) {
			const current = this.getLowestCostNode(frontier);
			const currentKey = this.createKey(current.row, current.column);

			frontier.delete(currentKey);

			for (const neighbor of this.getNeighbors(current.row, current.column)) {
				const movementCost = this.navigation.getMovementCost(
					neighbor.row,
					neighbor.column,
					movingEntity,
				);

				if (movementCost === null) {
					continue;
				}

				const nextCost = current.cost + movementCost;
				if (nextCost > maximumCost) {
					continue;
				}

				const neighborKey = this.createKey(neighbor.row, neighbor.column);
				const knownCost = bestCosts.get(neighborKey);
				if (knownCost !== undefined && knownCost <= nextCost) {
					continue;
				}

				bestCosts.set(neighborKey, nextCost);

				const node: GridCostNode = {
					row: neighbor.row,
					column: neighbor.column,
					cost: nextCost,
				};

				positions.set(neighborKey, node);
				frontier.set(neighborKey, node);
			}
		}

		return Array.from(positions.values());
	}

	/**
	 * Returns the four orthogonal neighbors of a logical grid cell.
	 *
	 * @param row - Logical grid row.
	 * @param column - Logical grid column.
	 *
	 * @returns Four neighboring grid coordinates.
	 */
	private getNeighbors(
		row: number,
		column: number,
	): readonly {
		readonly row: number;
		readonly column: number;
	}[] {
		return [
			{
				row: row - 1,
				column,
			},
			{
				row,
				column: column + 1,
			},
			{
				row: row + 1,
				column,
			},
			{
				row,
				column: column - 1,
			},
		];
	}

	/**
	 * Selects the pending node with the lowest accumulated movement cost.
	 *
	 * @param frontier - Current Dijkstra frontier.
	 *
	 * @returns The lowest-cost pending node.
	 */
	private getLowestCostNode(frontier: ReadonlyMap<string, CostSearchNode>): CostSearchNode {
		let best: CostSearchNode | null = null;

		for (const node of frontier.values()) {
			if (best === null || node.cost < best.cost) {
				best = node;
			}
		}

		if (best === null) {
			throw new Error("Cannot resolve a cost field node from an empty frontier.");
		}

		return best;
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
