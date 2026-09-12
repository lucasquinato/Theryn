/**
 * File: GridPathfinder.ts
 * Path: src/game/navigation/
 */

import type { Entity } from "e@ecs/Entity.js";
import type { GridNavigation } from "g@navigation/GridNavigation.js";

/**
 * Represents a logical grid coordinate used by navigation paths.
 */
export interface GridPathNode {
	/**
	 * Logical grid row.
	 */
	readonly row: number;

	/**
	 * Logical grid column.
	 */
	readonly column: number;
}

/**
 * Represents a completed navigation path.
 */
export interface GridPath {
	/**
	 * Ordered grid cells that must be entered to reach the destination.
	 *
	 * The starting cell is intentionally excluded.
	 */
	readonly nodes: readonly GridPathNode[];

	/**
	 * Total accumulated movement cost of the path.
	 */
	readonly cost: number;
}

/**
 * Internal search node used by the A* algorithm.
 */
interface SearchNode extends GridPathNode {
	/**
	 * Accumulated movement cost from the start node.
	 */
	readonly g: number;

	/**
	 * Estimated remaining cost to the destination.
	 */
	readonly h: number;

	/**
	 * Combined A* score.
	 */
	readonly f: number;
}

/**
 * Finds minimum-cost navigable paths across the logical game grid.
 *
 * Navigation uses four-directional movement only. Diagonal movement is not
 * supported.
 *
 * Walkability, occupancy, and movement cost are delegated entirely to
 * GridNavigation so the pathfinder remains independent from tile semantics and
 * ECS details.
 */
export class GridPathfinder {
	/**
	 * Shared navigation resolver used to validate cells and resolve movement
	 * costs.
	 */
	private readonly navigation: GridNavigation;

	/**
	 * Creates a grid pathfinder.
	 *
	 * @param navigation - Shared grid navigation resolver.
	 */
	public constructor(navigation: GridNavigation) {
		this.navigation = navigation;
	}

	/**
	 * Finds a minimum-cost path between two logical grid positions.
	 *
	 * The returned path excludes the starting cell and contains only the cells
	 * the entity must enter to reach the destination.
	 *
	 * @param startRow - Starting logical row.
	 * @param startColumn - Starting logical column.
	 * @param targetRow - Destination logical row.
	 * @param targetColumn - Destination logical column.
	 * @param movingEntity - Optional entity ignored during occupancy checks.
	 *
	 * @returns The completed path and its accumulated cost, or `null` when no
	 * valid route exists.
	 */
	public findPath(
		startRow: number,
		startColumn: number,
		targetRow: number,
		targetColumn: number,
		movingEntity: Entity | null = null,
	): GridPath | null {
		if (startRow === targetRow && startColumn === targetColumn) {
			return {
				nodes: [],
				cost: 0,
			};
		}

		if (this.navigation.getMovementCost(targetRow, targetColumn, movingEntity) === null) {
			return null;
		}

		const startKey = this.createKey(startRow, startColumn);

		const targetKey = this.createKey(targetRow, targetColumn);

		const open = new Map<string, SearchNode>();

		const closed = new Set<string>();

		const cameFrom = new Map<string, string>();

		const positions = new Map<string, GridPathNode>();

		const startH = this.heuristic(startRow, startColumn, targetRow, targetColumn);

		open.set(startKey, {
			row: startRow,
			column: startColumn,
			g: 0,
			h: startH,
			f: startH,
		});

		positions.set(startKey, {
			row: startRow,
			column: startColumn,
		});

		while (open.size > 0) {
			const current = this.getLowestScoreNode(open);

			const currentKey = this.createKey(current.row, current.column);

			if (currentKey === targetKey) {
				return {
					nodes: this.reconstructPath(startKey, targetKey, cameFrom, positions),
					cost: current.g,
				};
			}

			open.delete(currentKey);
			closed.add(currentKey);

			for (const neighbor of this.getNeighbors(current.row, current.column)) {
				const neighborKey = this.createKey(neighbor.row, neighbor.column);

				if (closed.has(neighborKey)) {
					continue;
				}

				const movementCost = this.navigation.getMovementCost(
					neighbor.row,
					neighbor.column,
					movingEntity,
				);

				if (movementCost === null) {
					continue;
				}

				const tentativeG = current.g + movementCost;

				const existing = open.get(neighborKey);

				if (existing && tentativeG >= existing.g) {
					continue;
				}

				const h = this.heuristic(neighbor.row, neighbor.column, targetRow, targetColumn);

				const node: SearchNode = {
					row: neighbor.row,
					column: neighbor.column,
					g: tentativeG,
					h,
					f: tentativeG + h,
				};

				open.set(neighborKey, node);

				positions.set(neighborKey, neighbor);

				cameFrom.set(neighborKey, currentKey);
			}
		}

		return null;
	}

	/**
	 * Returns the four orthogonal neighbors of a logical grid cell.
	 */
	private getNeighbors(row: number, column: number): readonly GridPathNode[] {
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
	 * Estimates remaining movement cost using Manhattan distance.
	 *
	 * With the current minimum movement cost of `1`, Manhattan distance remains
	 * an admissible heuristic for four-directional navigation.
	 */
	private heuristic(
		row: number,
		column: number,
		targetRow: number,
		targetColumn: number,
	): number {
		return Math.abs(targetRow - row) + Math.abs(targetColumn - column);
	}

	/**
	 * Selects the open node with the lowest A* score.
	 *
	 * Heuristic cost is used as a deterministic tie-breaker.
	 */
	private getLowestScoreNode(open: ReadonlyMap<string, SearchNode>): SearchNode {
		let best: SearchNode | null = null;

		for (const node of open.values()) {
			if (best === null || node.f < best.f || (node.f === best.f && node.h < best.h)) {
				best = node;
			}
		}

		if (best === null) {
			throw new Error("Cannot resolve a pathfinder node from an empty open set.");
		}

		return best;
	}

	/**
	 * Reconstructs a completed path from the A* parent relationship map.
	 *
	 * The start cell is intentionally excluded from the result.
	 */
	private reconstructPath(
		startKey: string,
		targetKey: string,
		cameFrom: ReadonlyMap<string, string>,
		positions: ReadonlyMap<string, GridPathNode>,
	): readonly GridPathNode[] {
		const path: GridPathNode[] = [];

		let currentKey = targetKey;

		while (currentKey !== startKey) {
			const position = positions.get(currentKey);

			if (!position) {
				throw new Error(`Missing grid position for path node '${currentKey}'.`);
			}

			path.push(position);

			const parent = cameFrom.get(currentKey);

			if (!parent) {
				throw new Error(`Missing parent for path node '${currentKey}'.`);
			}

			currentKey = parent;
		}

		path.reverse();

		return path;
	}

	/**
	 * Creates a stable lookup key for a logical grid position.
	 */
	private createKey(row: number, column: number): string {
		return `${row}:${column}`;
	}
}
