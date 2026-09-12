/**
 * File: GridNavigation.ts
 * Path: src/game/navigation/
 */

import { Tile } from "g@components/Tile.js";
import { GridPosition } from "g@components/GridPosition.js";

import type { ECSManager } from "e@ecs/ECSManager.js";
import type { Entity } from "e@ecs/Entity.js";

import type { TileRegistry } from "g@tiles/TileRegistry.js";

/**
 * Provides shared spatial navigation rules for the logical game grid.
 *
 * GridNavigation centralizes tile walkability and cell occupancy checks used
 * by systems such as hover, selection, pathfinding, and movement.
 *
 * A navigable cell must contain exactly one layer-zero Tile entity whose tile
 * definition is marked as walkable. Additional entities sharing the same
 * GridPosition make the cell occupied and therefore non-navigable.
 *
 * Specific entities may be ignored during occupancy checks. This is useful
 * when evaluating the cell currently occupied by the moving entity itself.
 */
export class GridNavigation {
	/**
	 * Shared ECS runtime containing grid-positioned entities.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Tile gameplay registry used to resolve walkability semantics.
	 */
	private readonly tiles: TileRegistry;

	/**
	 * Creates a grid navigation resolver.
	 *
	 * @param ecs - Shared ECS runtime.
	 * @param tiles - Tile gameplay registry.
	 */
	public constructor(ecs: ECSManager, tiles: TileRegistry) {
		this.ecs = ecs;
		this.tiles = tiles;
	}

	/**
	 * Determines whether a logical grid cell is navigable.
	 *
	 * The cell must contain exactly one non-ignored entity, and that entity
	 * must be a walkable layer-zero Tile.
	 *
	 * @param row - Logical grid row.
	 * @param column - Logical grid column.
	 * @param ignoredEntity - Optional entity excluded from occupancy checks.
	 *
	 * @returns `true` when the cell is valid for navigation.
	 */
	public isWalkable(row: number, column: number, ignoredEntity: Entity | null = null): boolean {
		return this.getWalkableTile(row, column, ignoredEntity) !== null;
	}

	/**
	 * Resolves the walkable layer-zero tile occupying a grid cell.
	 *
	 * The cell is rejected when empty, occupied by more than one non-ignored
	 * entity, occupied by a non-Tile entity, occupied by a Tile outside layer
	 * zero, or backed by a tile definition that is not walkable.
	 *
	 * @param row - Logical grid row.
	 * @param column - Logical grid column.
	 * @param ignoredEntity - Optional entity excluded from occupancy checks.
	 *
	 * @returns The navigable tile entity, or `null` when the cell is blocked.
	 */
	public getWalkableTile(
		row: number,
		column: number,
		ignoredEntity: Entity | null = null,
	): Entity | null {
		const occupants = this.getOccupants(row, column, ignoredEntity);
		if (occupants.length !== 1) {
			return null;
		}

		const entity = occupants[0];
		if (!this.ecs.hasComponent(entity, Tile)) {
			return null;
		}

		const tile = this.ecs.getComponent(entity, Tile)!;
		if (tile.layer !== 0) {
			return null;
		}

		const definition = this.tiles.get(tile.id);
		if (!definition.walkable) {
			return null;
		}

		return entity;
	}

	/**
	 * Returns every non-ignored entity occupying a logical grid cell.
	 *
	 * Occupancy is determined exclusively through GridPosition and is
	 * independent from entity type.
	 *
	 * @param row - Logical grid row.
	 * @param column - Logical grid column.
	 * @param ignoredEntity - Optional entity excluded from the result.
	 *
	 * @returns Entities sharing the requested grid position.
	 */
	public getOccupants(
		row: number,
		column: number,
		ignoredEntity: Entity | null = null,
	): readonly Entity[] {
		const occupants: Entity[] = [];

		const entities = this.ecs.query(GridPosition);

		for (const entity of entities) {
			if (entity === ignoredEntity) {
				continue;
			}

			const position = this.ecs.getComponent(entity, GridPosition)!;
			if (position.row !== row || position.column !== column) {
				continue;
			}

			occupants.push(entity);
		}

		return occupants;
	}
}
