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
		],
		water: [
			{
				id: 401,
				key: "water:default",
				framePosition: [4, 5],
			},
		],
		rock: [
			{
				id: 501,
				key: "rock:default",
				framePosition: [6, 3],
			},
		],
	},
} as const satisfies TilesetDefinition;
