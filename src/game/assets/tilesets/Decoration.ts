import type { TilesetDefinition } from "e@loader/texture/TextureLoader.js";

/**
 * Defines the decoration tileset used by the game world.
 *
 * Contains decorative tile definitions and their corresponding
 * frame positions within the decoration texture atlas.
 */
export const DecorationTileset = {
	src: "/public/game/textures/tilesets/decoration.png",
	key: "decoration",

	frameSize: {
		width: 32,
		height: 32,
	},

	definitions: {
		flowers: [
			{
				id: 1001,
				key: "common:flower",
				framePosition: [0, 1],
			},
			{
				id: 1002,
				key: "common:minor",
				framePosition: [0, 0],
			},
		],
		trunk: [
			{
				id: 1101,
				key: "common:double",
				framePosition: [0, 9],
			},
		],
	},
} as const satisfies TilesetDefinition;
