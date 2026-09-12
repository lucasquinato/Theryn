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
 * Finds navigable paths across the logical game grid.
 *
 * Navigation uses four-directional movement only. Diagonal movement is not
 * supported.
 *
 * Walkability and occupancy rules are delegated entirely to GridNavigation so
 * the pathfinder remains independent from tile semantics and ECS details.
 */
export class GridPathfinder {
	/**
	 * Shared navigation resolver used to validate traversable cells.
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
	 * Finds a path between two logical grid positions.
	 *
	 * The returned path excludes the starting cell and contains only the cells
	 * the entity must enter to reach the destination.
	 *
	 * The moving entity may be ignored during occupancy checks so its current
	 * grid cell does not invalidate the search origin.
	 *
	 * @param startRow - Starting logical row.
	 * @param startColumn - Starting logical column.
	 * @param targetRow - Destination logical row.
	 * @param targetColumn - Destination logical column.
	 * @param movingEntity - Optional entity ignored during occupancy checks.
	 *
	 * @returns The path to the destination, or an empty array when no valid
	 * route exists.
	 */
	public findPath(
		startRow: number,
		startColumn: number,
		targetRow: number,
		targetColumn: number,
		movingEntity: Entity | null = null,
	): readonly GridPathNode[] {
		if (startRow === targetRow && startColumn === targetColumn) {
			return [];
		}

		if (!this.navigation.isWalkable(targetRow, targetColumn, movingEntity)) {
			return [];
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
				return this.reconstructPath(startKey, targetKey, cameFrom, positions);
			}

			open.delete(currentKey);
			closed.add(currentKey);

			for (const neighbor of this.getNeighbors(current.row, current.column)) {
				const neighborKey = this.createKey(neighbor.row, neighbor.column);
				if (closed.has(neighborKey)) {
					continue;
				}

				if (!this.navigation.isWalkable(neighbor.row, neighbor.column, movingEntity)) {
					continue;
				}

				const tentativeG = current.g + 1;

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

		return [];
	}

	/**
	 * Returns the four orthogonal grid neighbors of a cell.
	 *
	 * Neighbor order is deterministic and follows the game's directional
	 * animation mapping.
	 *
	 * @param row - Logical grid row.
	 * @param column - Logical grid column.
	 *
	 * @returns Four candidate neighboring cells.
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
	 * Calculates Manhattan distance between two grid positions.
	 *
	 * Manhattan distance is admissible for four-directional movement where
	 * every step has equal cost.
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
	 * Heuristic cost is used as a deterministic tie-breaker so nodes closer to
	 * the destination are preferred when total scores are equal.
	 *
	 * @param open - Current open search set.
	 *
	 * @returns The next search node to expand.
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
	 * The start cell is intentionally removed from the result so the first path
	 * node always represents the next cell the entity must enter.
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
	 *
	 * @param row - Logical grid row.
	 * @param column - Logical grid column.
	 */
	private createKey(row: number, column: number): string {
		return `${row}:${column}`;
	}
}
