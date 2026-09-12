/**
 * File: MapInstance.ts
 * Path: src/game/maps/
 */

import { GridPosition } from "g@components/GridPosition.js";
import { Tile } from "g@components/Tile.js";

import type { ECSManager } from "e@ecs/ECSManager.js";
import type { Entity } from "e@ecs/Entity.js";

import type { MapDefinition } from "g@maps/MapDefinition.js";

/**
 * Represents a runtime instance of a map inside the ECS.
 *
 * A MapInstance converts every non-empty cell from a MapDefinition into an
 * independent ECS entity containing GridPosition and Tile components.
 *
 * The instance owns the entities it creates and keeps their identifiers so
 * the entire map can be removed from the ECS when unloaded.
 *
 * MapInstance is responsible only for the runtime lifecycle of map entities.
 * Rendering and other behavior remain the responsibility of ECS systems.
 */
export class MapInstance {
	/**
	 * ECS runtime where this map creates and owns its entities.
	 */
	private readonly ecs: ECSManager;

	/**
	 * Immutable map definition used to instantiate tile entities.
	 */
	private readonly definition: MapDefinition;

	/**
	 * Entity identifiers created and owned by this map instance.
	 *
	 * Only entities created during load() are stored here, allowing unload()
	 * to destroy exactly the runtime entities that belong to this map.
	 */
	private readonly entities: Entity[] = [];

	/**
	 * Indicates whether this map is currently instantiated inside the ECS.
	 */
	private loaded = false;

	/**
	 * Creates a runtime map instance.
	 *
	 * Construction does not create any ECS entities. The map is instantiated
	 * only when load() is called.
	 *
	 * @param ecs - ECS runtime that will contain the map entities.
	 * @param definition - Immutable map definition to instantiate.
	 */
	public constructor(ecs: ECSManager, definition: MapDefinition) {
		this.ecs = ecs;
		this.definition = definition;
	}

	/**
	 * Instantiates every non-empty tile from the map definition.
	 *
	 * Each non-zero cell becomes an independent ECS entity containing:
	 *
	 * - GridPosition with the cell row and column.
	 * - Tile with the global tile identifier and source map layer.
	 *
	 * Empty cells represented by zero are ignored.
	 *
	 * Multiple layers may create different entities at the same grid
	 * position. Their original layers remain preserved by the Tile component.
	 *
	 * Repeated calls while the map is already loaded have no effect.
	 */
	public load(): void {
		if (this.loaded) {
			return;
		}

		for (const [layerKey, rows] of Object.entries(this.definition)) {
			const layer = Number(layerKey);

			for (let row = 0; row < rows.length; row++) {
				const columns = rows[row];

				for (let column = 0; column < columns.length; column++) {
					const tileID = columns[column];

					if (tileID === 0) {
						continue;
					}

					const entity = this.ecs.createEntity();

					this.ecs.addComponent(entity, new GridPosition(row, column));

					this.ecs.addComponent(entity, new Tile(tileID, layer));

					this.entities.push(entity);
				}
			}
		}

		this.loaded = true;
	}

	/**
	 * Removes this map instance from the ECS.
	 *
	 * Every entity previously created by load() is destroyed, including all
	 * components attached to those entities by the ECS.
	 *
	 * After unloading, the instance may be loaded again and will create a new
	 * set of entity identifiers from the same map definition.
	 *
	 * Repeated calls while the map is already unloaded have no effect.
	 */
	public unload(): void {
		if (!this.loaded) {
			return;
		}

		for (const entity of this.entities) {
			this.ecs.destroyEntity(entity);
		}

		this.entities.length = 0;
		this.loaded = false;
	}
}
