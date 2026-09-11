/**
 * File: Decoration.ts
 * Path: src/game/assets/tilesets/
 */

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
				id: 901,
				key: "common:minor",
				framePosition: [0, 0],
			},
			{
				id: 902,
				key: "common:flower",
				framePosition: [0, 1],
			},
			{
				id: 903,
				key: "common:tall:grass",
				framePosition: [0, 4],
			},
			{
				id: 904,
				key: "tall:grass:purple",
				framePosition: [0, 2],
			},
			{
				id: 910,
				key: "flower:one",
				framePosition: [0, 6],
			},
			{
				id: 911,
				key: "flower:tall:circle",
				framePosition: [0, 8],
			},
			{
				id: 912,
				key: "flowers",
				framePosition: [1, 1],
			},
		],
		trunk: [
			{
				id: 905,
				key: "trunk:default",
				framePosition: [0, 5],
			},
			{
				id: 906,
				key: "double:trunk",
				framePosition: [0, 9],
			},
			{
				id: 907,
				key: "trunk:low:grass",
				framePosition: [0, 3],
			},
			{
				id: 908,
				key: "trunk:high:grass",
				framePosition: [0, 7],
			},
			{
				id: 909,
				key: "trunk:high:grass:down",
				framePosition: [1, 2],
			},
		],
		rocks: [
			{
				id: 913,
				key: "rock:small",
				framePosition: [1, 0],
			},
			{
				id: 914,
				key: "rock:type:1",
				framePosition: [1, 4],
			},
			{
				id: 915,
				key: "rock:type:2",
				framePosition: [1, 3],
			},
			{
				id: 916,
				key: "rock:type:3",
				framePosition: [1, 5],
			},
			{
				id: 917,
				key: "rock:type:4",
				framePosition: [1, 6],
			},
			{
				id: 918,
				key: "rock:type:5",
				framePosition: [1, 7],
			},
			{
				id: 919,
				key: "rock:type:6",
				framePosition: [1, 8],
			},
			{
				id: 920,
				key: "rock:type:7",
				framePosition: [1, 9],
			},
		],
	},
} as const satisfies TilesetDefinition;
