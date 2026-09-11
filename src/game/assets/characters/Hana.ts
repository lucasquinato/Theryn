/**
 * File: Hana.ts
 * Path: src/game/assets/characters/
 */

import type { SpriteSheetDefinition } from "e@loader/texture/TextureLoader.js";

/**
 * Defines Hana's character sprite sheet.
 *
 * Contains the frame dimensions and directional animation
 * sequences available within the character texture.
 */
export const HanaSpriteSheet = {
	src: "/public/game/textures/characters/hana/spritesheet_hana.png",
	key: "hana",

	frameSize: {
		width: 32,
		height: 48,
	},

	animations: {
		default: {
			idle: {
				frames: {
					from: [10, 0],
					to: [10, 7],
				},
				fps: 8,
			},
		},
		idle: {
			rightDown: {
				frames: {
					from: [0, 0],
					to: [0, 7],
				},
				fps: 8,
			},
			leftDown: {
				frames: {
					from: [0, 8],
					to: [0, 15],
				},
				fps: 8,
			},
			rightTop: {
				frames: {
					from: [1, 0],
					to: [1, 7],
				},
				fps: 8,
			},
			leftTop: {
				frames: {
					from: [1, 8],
					to: [1, 15],
				},
				fps: 8,
			},
		},
		walk: {
			rightDown: {
				frames: {
					from: [2, 0],
					to: [2, 7],
				},
				fps: 8,
			},
			leftDown: {
				frames: {
					from: [2, 8],
					to: [2, 15],
				},
				fps: 8,
			},
			rightTop: {
				frames: {
					from: [3, 0],
					to: [3, 7],
				},
				fps: 8,
			},
			leftTop: {
				frames: {
					from: [3, 8],
					to: [3, 15],
				},
				fps: 8,
			},
		},
		death: {
			rightDown: {
				frames: {
					from: [4, 0],
					to: [4, 7],
				},
				fps: 8,
			},
			leftDown: {
				frames: {
					from: [4, 8],
					to: [4, 15],
				},
				fps: 8,
			},
			rightTop: {
				frames: {
					from: [5, 0],
					to: [5, 7],
				},
				fps: 8,
			},
			leftTop: {
				frames: {
					from: [5, 8],
					to: [5, 15],
				},
				fps: 8,
			},
		},
	},
} as const satisfies SpriteSheetDefinition;
