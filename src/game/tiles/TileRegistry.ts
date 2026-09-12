/**
 * File: TileRegistry.ts
 * Path: src/game/tiles/
 */

import type { TileDefinition } from "g@tiles/TileDefinition.js";

/**
 * Stores gameplay definitions associated with tile IDs.
 *
 * Tile IDs act as registry keys while TileDefinition objects describe the
 * gameplay semantics associated with each tile type.
 *
 * Registrations are intentionally overwriteable. When the same tile ID is
 * registered multiple times, the most recent registration replaces the
 * previous definition entirely.
 */
export class TileRegistry {
	/**
	 * Registered tile definitions indexed by tile ID.
	 */
	private readonly definitions = new Map<number, TileDefinition>();

	/**
	 * Registers a definition for a single tile ID.
	 *
	 * If the tile ID has already been registered, the existing definition is
	 * replaced entirely by the new definition.
	 *
	 * @param id - Positive integer tile ID.
	 * @param definition - Gameplay definition associated with the tile.
	 *
	 * @returns This registry instance for fluent registration.
	 *
	 * @throws {RangeError} If the tile ID is not a positive integer.
	 */
	public register(id: number, definition: TileDefinition): this {
		this.assertValidID(id);

		this.definitions.set(id, definition);

		return this;
	}

	/**
	 * Registers the same definition for an inclusive range of tile IDs.
	 *
	 * Existing definitions inside the range are replaced. Later registrations
	 * may override individual IDs again.
	 *
	 * @param from - First tile ID in the inclusive range.
	 * @param to - Last tile ID in the inclusive range.
	 * @param definition - Gameplay definition applied to every tile in range.
	 *
	 * @returns This registry instance for fluent registration.
	 *
	 * @throws {RangeError} If either ID is invalid or if `from` is greater
	 * than `to`.
	 */
	public registerRange(from: number, to: number, definition: TileDefinition): this {
		this.assertValidID(from);
		this.assertValidID(to);

		if (from > to) {
			throw new RangeError("Tile registry range start cannot be greater than range end.");
		}

		for (let id = from; id <= to; id++) {
			this.register(id, definition);
		}

		return this;
	}

	/**
	 * Returns the gameplay definition associated with a tile ID.
	 *
	 * Missing definitions are treated as configuration errors because every
	 * gameplay tile is expected to have explicitly defined semantics before
	 * systems begin consuming the registry.
	 *
	 * @param id - Tile ID to resolve.
	 *
	 * @returns The registered tile definition.
	 *
	 * @throws {RangeError} If the tile ID is not a positive integer.
	 * @throws {Error} If the tile ID has no registered definition.
	 */
	public get(id: number): TileDefinition {
		this.assertValidID(id);

		const definition = this.definitions.get(id);

		if (!definition) {
			throw new Error(`Tile ID ${id} has no registered definition.`);
		}

		return definition;
	}

	/**
	 * Determines whether a tile ID has a registered definition.
	 *
	 * @param id - Tile ID to inspect.
	 *
	 * @returns `true` when the tile has been registered.
	 *
	 * @throws {RangeError} If the tile ID is not a positive integer.
	 */
	public has(id: number): boolean {
		this.assertValidID(id);

		return this.definitions.has(id);
	}

	/**
	 * Validates whether a value can be used as a tile ID.
	 *
	 * Tile ID zero is reserved by map definitions to represent an empty cell
	 * and therefore cannot be registered.
	 *
	 * @param id - Tile ID to validate.
	 *
	 * @throws {RangeError} If the ID is not a positive integer.
	 */
	private assertValidID(id: number): void {
		if (!Number.isInteger(id) || id <= 0) {
			throw new RangeError(`Tile ID must be a positive integer. Received: ${id}.`);
		}
	}
}
