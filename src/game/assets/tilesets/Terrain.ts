/**
 * File: Terrain.ts
 * Path: src/game/assets/tilesets/
 */

import type { TilesetDefinition } from "e@loader/texture/TextureLoader.js";

/**
 * Defines the terrain tileset used by the game world.
 *
 * Contains terrain tile definitions and their corresponding
 * frame positions within the terrain texture atlas.
 */
export const TerrainTileset = {
	src: "/public/game/textures/tilesets/terrain.png",
	key: "terrain",

	frameSize: {
		width: 32,
		height: 32,
	},

	definitions: {
		grass: [
			{
				id: 1,
				key: "grass:default",
				framePosition: [0, 0],
			},
			{
				id: 301,
				key: "grass:type:01",
				framePosition: [3, 9],
			},
			{
				id: 302,
				key: "grass:type:02",
				framePosition: [3, 4],
			},
			{
				id: 303,
				key: "grass:type:03",
				framePosition: [3, 3],
			},
			{
				id: 304,
				key: "grass:type:04",
				framePosition: [3, 1],
			},
			{
				id: 305,
				key: "grass:type:05",
				framePosition: [3, 2],
			},
			{
				id: 306,
				key: "grass:type:06",
				framePosition: [3, 6],
			},
			{
				id: 307,
				key: "grass:type:07",
				framePosition: [3, 8],
			},
			{
				id: 308,
				key: "grass:type:08",
				framePosition: [4, 2],
			},
			{
				id: 309,
				key: "grass:type:09",
				framePosition: [3, 0],
			},
			{
				id: 310,
				key: "grass:type:10",
				framePosition: [4, 4],
			},
			{
				id: 311,
				key: "grass:type:11",
				framePosition: [3, 5],
			},
			{
				id: 312,
				key: "grass:type:12",
				framePosition: [4, 1],
			},
			{
				id: 313,
				key: "grass:type:13",
				framePosition: [3, 7],
			},
			{
				id: 314,
				key: "grass:type:14",
				framePosition: [4, 0],
			},
			{
				id: 315,
				key: "grass:type:15",
				framePosition: [4, 3],
			},
		],
		ice: [
			{
				id: 101,
				key: "ice:default",
				framePosition: [0, 4],
			},
			{
				id: 102,
				key: "ice:shine:top:right",
				framePosition: [0, 3],
			},
			{
				id: 103,
				key: "ice:shine:top:left",
				framePosition: [0, 2],
			},
			{
				id: 104,
				key: "ice:shine:top",
				framePosition: [0, 5],
			},
			{
				id: 105,
				key: "ice:brute",
				framePosition: [0, 1],
			},
		],
		sand: [
			{
				id: 201,
				key: "sand:default",
				framePosition: [0, 6],
			},
			{
				id: 202,
				key: "sand:dry",
				framePosition: [0, 7],
			},
			{
				id: 203,
				key: "sand:wet:left",
				framePosition: [0, 8],
			},
			{
				id: 204,
				key: "sand:wet:right",
				framePosition: [0, 9],
			},
			{
				id: 205,
				key: "sand:wet:right:top",
				framePosition: [1, 0],
			},
			{
				id: 206,
				key: "sand:wet:bottom",
				framePosition: [1, 1],
			},
			{
				id: 207,
				key: "sand:wet:top",
				framePosition: [1, 2],
			},
			{
				id: 208,
				key: "sand:wet:right:left",
				framePosition: [1, 3],
			},
			{
				id: 209,
				key: "sand:wet:center",
				framePosition: [1, 4],
			},
			{
				id: 210,
				key: "sand:wet:all",
				framePosition: [1, 5],
			},
			{
				id: 211,
				key: "sand:wet:left:bottom",
				framePosition: [1, 6],
			},
			{
				id: 212,
				key: "sand:type:01",
				framePosition: [1, 7],
			},
			{
				id: 213,
				key: "sand:type:02",
				framePosition: [1, 8],
			},
			{
				id: 214,
				key: "sand:type:03",
				framePosition: [1, 9],
			},
			{
				id: 215,
				key: "sand:type:04",
				framePosition: [2, 2],
			},
			{
				id: 216,
				key: "sand:type:05",
				framePosition: [2, 0],
			},
			{
				id: 217,
				key: "sand:type:06",
				framePosition: [2, 1],
			},
			{
				id: 218,
				key: "sand:type:07",
				framePosition: [2, 3],
			},
			{
				id: 219,
				key: "sand:type:08",
				framePosition: [2, 4],
			},
			{
				id: 220,
				key: "sand:type:09",
				framePosition: [2, 5],
			},
			{
				id: 221,
				key: "sand:type:10",
				framePosition: [2, 6],
			},
			{
				id: 222,
				key: "sand:type:11",
				framePosition: [2, 7],
			},
			{
				id: 223,
				key: "sand:type:12",
				framePosition: [2, 8],
			},
			{
				id: 224,
				key: "sand:type:13",
				framePosition: [2, 9],
			},
		],
		water: [
			{
				id: 401,
				key: "water:default",
				framePosition: [4, 5],
			},
			{
				id: 402,
				key: "water:type:01",
				framePosition: [4, 8],
			},
			{
				id: 403,
				key: "water:type:02",
				framePosition: [4, 7],
			},
			{
				id: 404,
				key: "water:type:03",
				framePosition: [4, 6],
			},
			{
				id: 405,
				key: "water:type:04",
				framePosition: [4, 9],
			},
			{
				id: 406,
				key: "water:type:05",
				framePosition: [5, 6],
			},
			{
				id: 407,
				key: "water:type:06",
				framePosition: [5, 5],
			},
			{
				id: 408,
				key: "water:type:07",
				framePosition: [5, 8],
			},
			{
				id: 409,
				key: "water:type:08",
				framePosition: [5, 7],
			},
			{
				id: 410,
				key: "water:type:09",
				framePosition: [5, 0],
			},
			{
				id: 411,
				key: "water:type:10",
				framePosition: [5, 1],
			},
			{
				id: 412,
				key: "water:type:11",
				framePosition: [5, 2],
			},
			{
				id: 413,
				key: "water:type:12",
				framePosition: [5, 3],
			},
			{
				id: 414,
				key: "water:type:13",
				framePosition: [5, 4],
			},
			{
				id: 415,
				key: "water:type:14",
				framePosition: [5, 9],
			},
			{
				id: 416,
				key: "water:type:15",
				framePosition: [6, 0],
			},
			{
				id: 417,
				key: "water:type:16",
				framePosition: [6, 1],
			},
			{
				id: 418,
				key: "water:type:17",
				framePosition: [6, 2],
			},
		],
		rock: [
			{
				id: 501,
				key: "rock:default",
				framePosition: [6, 3],
			},
			{
				id: 502,
				key: "rock:type:01",
				framePosition: [6, 4],
			},
			{
				id: 503,
				key: "rock:type:02",
				framePosition: [6, 5],
			},
			{
				id: 504,
				key: "rock:type:03",
				framePosition: [6, 6],
			},
			{
				id: 505,
				key: "rock:type:04",
				framePosition: [6, 7],
			},
			{
				id: 506,
				key: "rock:type:05",
				framePosition: [6, 8],
			},
			{
				id: 507,
				key: "rock:type:06",
				framePosition: [6, 9],
			},
			{
				id: 508,
				key: "rock:type:07",
				framePosition: [7, 0],
			},
			{
				id: 509,
				key: "rock:type:08",
				framePosition: [7, 2],
			},
			{
				id: 510,
				key: "rock:type:09",
				framePosition: [7, 1],
			},
			{
				id: 511,
				key: "rock:type:10",
				framePosition: [7, 3],
			},
			{
				id: 512,
				key: "rock:type:11",
				framePosition: [7, 5],
			},
			{
				id: 513,
				key: "rock:type:12",
				framePosition: [7, 6],
			},
			{
				id: 514,
				key: "rock:type:13",
				framePosition: [7, 4],
			},
			{
				id: 515,
				key: "rock:type:14",
				framePosition: [7, 7],
			},
			{
				id: 516,
				key: "rock:type:15",
				framePosition: [7, 8],
			},
			{
				id: 517,
				key: "rock:type:16",
				framePosition: [7, 9],
			},
		],
	},
} as const satisfies TilesetDefinition;
