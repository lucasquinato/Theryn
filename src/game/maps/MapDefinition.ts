/**
 * File: MapDefinition.ts
 * Path: src/game/maps/
 */

/**
 * Represents one row of global tile identifiers inside a map layer.
 *
 * Each array position corresponds to a grid column. A value of zero
 * represents an empty cell and does not create a tile entity when the map
 * is instantiated.
 */
export type MapRow = readonly number[];

/**
 * Represents a two-dimensional map layer.
 *
 * Each layer is organized as an array of rows, with every row containing the
 * global tile identifiers associated with its grid columns.
 */
export type MapLayer = readonly MapRow[];

/**
 * Represents an isometric map composed of numeric layers.
 *
 * Each numeric key identifies a map layer. Layers contain rows and columns of
 * global tile identifiers that can later be instantiated into ECS entities.
 *
 * Multiple layers may contain non-empty cells at the same grid position.
 * Those cells represent independent tiles and preserve their original layer
 * information when instantiated.
 *
 * Zero-valued cells are considered empty and do not create tile entities.
 */
export type MapDefinition = Readonly<Record<number, MapLayer>>;
