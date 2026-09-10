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
		},
	},
} as const satisfies SpriteSheetDefinition;
