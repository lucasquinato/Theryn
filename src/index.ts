/**
 * File: index.ts
 * Path: src/
 */

await import("e@engine/Engine.js");

import { TerrainTileset } from "./game/assets/tilesets/Terrain.js";
import { DecorationTileset } from "./game/assets/tilesets/Decoration.js";

await Theryn.loader.loadTileset(TerrainTileset);
await Theryn.loader.loadTileset(DecorationTileset);

import { HanaSpriteSheet } from "./game/assets/characters/Hana.js";

await Theryn.loader.loadSpritesheet(HanaSpriteSheet);
