/**
 * File: MouseInput.ts
 * Path: src/engine/input/mouse/
 */

/**
 * Mouse buttons exposed by the input subsystem.
 *
 * Values follow the standard PointerEvent button identifiers.
 */
export type MouseButton = 0 | 1 | 2 | 3 | 4;

/**
 * Represents the current logical mouse position inside the target canvas.
 */
export interface MousePosition {
	readonly x: number;
	readonly y: number;
}

/**
 * Represents the accumulated mouse wheel movement for the current frame.
 */
export interface MouseWheel {
	readonly x: number;
	readonly y: number;
}

/**
 * Tracks mouse state for a specific canvas.
 *
 * Browser coordinates are automatically converted from the canvas CSS size
 * into its internal logical buffer coordinates. This keeps mouse input aligned
 * with rendering even when the canvas is responsively scaled.
 *
 * Persistent state such as position, presence, pressure, and held buttons
 * remains available between frames. Transient state such as presses, releases,
 * clicks, and wheel movement is cleared by `endFrame()`.
 *
 * Only mouse pointer events are currently handled. Touch and pen input are
 * intentionally ignored.
 */
export class MouseInput {
	/**
	 * Canvas used as the mouse interaction surface.
	 */
	private readonly canvas: HTMLCanvasElement;

	/**
	 * Current logical horizontal mouse position inside the canvas.
	 */
	private positionX = 0;

	/**
	 * Current logical vertical mouse position inside the canvas.
	 */
	private positionY = 0;

	/**
	 * Indicates whether the mouse pointer is currently inside the canvas.
	 */
	private pointerInside = false;

	/**
	 * Current pressure reported by the active mouse pointer.
	 */
	private currentPressure = 0;

	/**
	 * Buttons currently held down.
	 */
	private readonly buttonsDown = new Set<MouseButton>();

	/**
	 * Buttons pressed during the current frame.
	 */
	private readonly buttonsPressed = new Set<MouseButton>();

	/**
	 * Buttons released during the current frame.
	 */
	private readonly buttonsReleased = new Set<MouseButton>();

	/**
	 * Buttons that produced a click during the current frame.
	 */
	private readonly buttonsClicked = new Set<MouseButton>();

	/**
	 * Accumulated horizontal wheel movement during the current frame.
	 */
	private wheelX = 0;

	/**
	 * Accumulated vertical wheel movement during the current frame.
	 */
	private wheelY = 0;

	/**
	 * Creates mouse input tracking for a canvas.
	 *
	 * @param canvas - Canvas that receives mouse interaction.
	 */
	public constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;

		this.canvas.addEventListener("pointerenter", this.handlePointerEnter);

		this.canvas.addEventListener("pointerleave", this.handlePointerLeave);

		this.canvas.addEventListener("pointermove", this.handlePointerMove);

		this.canvas.addEventListener("pointerdown", this.handlePointerDown);

		this.canvas.addEventListener("pointerup", this.handlePointerUp);

		this.canvas.addEventListener("pointercancel", this.handlePointerCancel);

		this.canvas.addEventListener("click", this.handleClick);

		this.canvas.addEventListener("wheel", this.handleWheel, {
			passive: true,
		});
	}

	/**
	 * Current logical mouse position inside the canvas.
	 */
	public get position(): MousePosition {
		return {
			x: this.positionX,
			y: this.positionY,
		};
	}

	/**
	 * Current horizontal logical mouse position.
	 */
	public get x(): number {
		return this.positionX;
	}

	/**
	 * Current vertical logical mouse position.
	 */
	public get y(): number {
		return this.positionY;
	}

	/**
	 * Indicates whether the mouse pointer is currently inside the canvas.
	 */
	public get inside(): boolean {
		return this.pointerInside;
	}

	/**
	 * Current pointer pressure reported by the browser.
	 */
	public get pressure(): number {
		return this.currentPressure;
	}

	/**
	 * Mouse wheel movement accumulated during the current frame.
	 */
	public get wheel(): MouseWheel {
		return {
			x: this.wheelX,
			y: this.wheelY,
		};
	}

	/**
	 * Determines whether a mouse button is currently held down.
	 *
	 * @param button - Mouse button to inspect.
	 */
	public isDown(button: MouseButton): boolean {
		return this.buttonsDown.has(button);
	}

	/**
	 * Determines whether a mouse button was pressed during the current frame.
	 *
	 * @param button - Mouse button to inspect.
	 */
	public wasPressed(button: MouseButton): boolean {
		return this.buttonsPressed.has(button);
	}

	/**
	 * Determines whether a mouse button was released during the current frame.
	 *
	 * @param button - Mouse button to inspect.
	 */
	public wasReleased(button: MouseButton): boolean {
		return this.buttonsReleased.has(button);
	}

	/**
	 * Determines whether a mouse button produced a click during the current
	 * frame.
	 *
	 * @param button - Mouse button to inspect.
	 */
	public wasClicked(button: MouseButton): boolean {
		return this.buttonsClicked.has(button);
	}

	/**
	 * Clears mouse state that is valid for only one engine frame.
	 */
	public endFrame(): void {
		this.buttonsPressed.clear();
		this.buttonsReleased.clear();
		this.buttonsClicked.clear();

		this.wheelX = 0;
		this.wheelY = 0;
	}

	/**
	 * Handles the mouse entering the canvas interaction area.
	 */
	private readonly handlePointerEnter = (event: PointerEvent): void => {
		if (!this.isMousePointer(event)) {
			return;
		}

		this.pointerInside = true;

		this.updatePosition(event);
		this.currentPressure = event.pressure;
	};

	/**
	 * Handles the mouse leaving the canvas interaction area.
	 */
	private readonly handlePointerLeave = (event: PointerEvent): void => {
		if (!this.isMousePointer(event)) {
			return;
		}

		this.pointerInside = false;
	};

	/**
	 * Handles mouse pointer movement.
	 */
	private readonly handlePointerMove = (event: PointerEvent): void => {
		if (!this.isMousePointer(event)) {
			return;
		}

		this.updatePosition(event);
		this.currentPressure = event.pressure;
	};

	/**
	 * Handles mouse button presses.
	 */
	private readonly handlePointerDown = (event: PointerEvent): void => {
		if (!this.isMousePointer(event)) {
			return;
		}

		const button = this.resolveButton(event.button);
		if (button === null) {
			return;
		}

		this.updatePosition(event);
		this.currentPressure = event.pressure;

		if (!this.buttonsDown.has(button)) {
			this.buttonsPressed.add(button);
		}

		this.buttonsDown.add(button);
		this.canvas.setPointerCapture(event.pointerId);
	};

	/**
	 * Handles mouse button releases.
	 */
	private readonly handlePointerUp = (event: PointerEvent): void => {
		if (!this.isMousePointer(event)) {
			return;
		}

		const button = this.resolveButton(event.button);
		if (button === null) {
			return;
		}

		this.updatePosition(event);
		this.currentPressure = event.pressure;

		this.buttonsDown.delete(button);
		this.buttonsReleased.add(button);

		if (this.canvas.hasPointerCapture(event.pointerId)) {
			this.canvas.releasePointerCapture(event.pointerId);
		}
	};

	/**
	 * Handles pointer cancellation by clearing held mouse state.
	 */
	private readonly handlePointerCancel = (event: PointerEvent): void => {
		if (!this.isMousePointer(event)) {
			return;
		}

		for (const button of this.buttonsDown) {
			this.buttonsReleased.add(button);
		}

		this.buttonsDown.clear();
		this.currentPressure = 0;
	};

	/**
	 * Handles completed mouse clicks.
	 */
	private readonly handleClick = (event: PointerEvent): void => {
		if (!this.isMousePointer(event)) {
			return;
		}

		const button = this.resolveButton(event.button);
		if (button === null) {
			return;
		}

		this.updatePosition(event);

		this.buttonsClicked.add(button);
	};

	/**
	 * Handles mouse wheel movement.
	 *
	 * Wheel values are accumulated because multiple browser wheel events may
	 * occur between two engine frames.
	 */
	private readonly handleWheel = (event: WheelEvent): void => {
		this.updatePosition(event);

		this.wheelX += event.deltaX;
		this.wheelY += event.deltaY;
	};

	/**
	 * Converts browser client coordinates into logical canvas coordinates.
	 */
	private updatePosition(event: MouseEvent | PointerEvent | WheelEvent): void {
		const bounds = this.canvas.getBoundingClientRect();
		if (bounds.width <= 0 || bounds.height <= 0) {
			return;
		}

		const scaleX = this.canvas.width / bounds.width;
		const scaleY = this.canvas.height / bounds.height;

		this.positionX = (event.clientX - bounds.left) * scaleX;
		this.positionY = (event.clientY - bounds.top) * scaleY;
	}

	/**
	 * Determines whether a PointerEvent belongs to a mouse.
	 */
	private isMousePointer(event: PointerEvent): boolean {
		return event.pointerType === "mouse";
	}

	/**
	 * Converts a browser button identifier into a supported mouse button.
	 *
	 * @param button - Browser button identifier.
	 */
	private resolveButton(button: number): MouseButton | null {
		switch (button) {
			case 0:
			case 1:
			case 2:
			case 3:
			case 4:
				return button;

			default:
				return null;
		}
	}
}
