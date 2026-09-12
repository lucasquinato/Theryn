/**
 * File: Sprite.ts
 * Path: src/game/components/
 */

/**
 * Describes the visual sprite resource associated with an entity.
 *
 * The component stores persistent visual configuration such as the texture
 * resource, local render order, and drawing offsets. Runtime animation state
 * belongs to Animator, while logical world placement belongs to GridPosition.
 */
export class Sprite {
	/**
	 * Loader resource key used to resolve the sprite texture.
	 */
	public readonly textureKey: string;

	/**
	 * Local render order used only when multiple render commands occupy the
	 * exact same logical grid position.
	 */
	public readonly order: number;

	/**
	 * Horizontal visual offset applied to the sprite in world-space pixels.
	 *
	 * This value affects only drawing placement and never changes the entity's
	 * logical grid position or render ordering.
	 */
	public readonly offsetX: number;

	/**
	 * Vertical visual offset applied to the sprite in world-space pixels.
	 *
	 * This value affects only drawing placement and never changes the entity's
	 * logical grid position, camera target, or render ordering.
	 */
	public readonly offsetY: number;

	/**
	 * Creates a sprite component.
	 *
	 * @param textureKey - Loader resource key associated with the sprite.
	 * @param order - Local render order inside the same grid position.
	 * @param offsetX - Horizontal visual offset in world-space pixels.
	 * @param offsetY - Vertical visual offset in world-space pixels.
	 *
	 * @throws {Error} If the texture key is empty.
	 */
	public constructor(textureKey: string, order = 0, offsetX = 0, offsetY = 0) {
		if (textureKey.trim().length === 0) {
			throw new Error("Sprite texture key cannot be empty.");
		}

		this.textureKey = textureKey;
		this.order = order;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
	}
}
