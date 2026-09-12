/**
 * File: System.ts
 * Path: src/engine/ecs/
 */

/**
 * Execution phase assigned to an ECS system.
 *
 * Update systems participate in the simulation phase while render systems
 * participate in the rendering phase.
 */
export type SystemPhase = "update" | "render";

/**
 * Lifecycle scope assigned to an ECS system.
 *
 * Required systems remain active independently of scene transitions, while
 * scene systems are activated and deactivated according to the lifecycle of
 * their owning scene.
 */
export type SystemScope = "required" | "scene";

/**
 * Base class for ECS systems.
 *
 * A system defines behavior executed by the ECS during a specific engine
 * phase. Its phase determines when it executes, while its scope determines
 * how its active lifecycle is controlled.
 *
 * Required systems belong to the persistent runtime lifecycle. Scene systems
 * belong to a specific scene lifecycle and are enabled or disabled as that
 * scene becomes active or inactive.
 */
export abstract class System {
	/**
	 * Indicates whether this system is currently active.
	 */
	private enabled: boolean;

	/**
	 * Execution phase in which this system participates.
	 */
	public readonly phase: SystemPhase;

	/**
	 * Lifecycle scope controlling how this system is activated.
	 */
	public readonly scope: SystemScope;

	/**
	 * Creates an ECS system.
	 *
	 * Required systems start enabled because they remain active independently
	 * of scene transitions. Scene systems start disabled until their owning
	 * scene becomes active.
	 *
	 * @param phase - Engine phase in which the system executes.
	 * @param scope - Lifecycle scope controlling system activation.
	 */
	public constructor(phase: SystemPhase, scope: SystemScope) {
		this.phase = phase;
		this.scope = scope;
		this.enabled = scope === "required";
	}

	/**
	 * Indicates whether this system is currently active.
	 *
	 * Disabled systems remain registered in the ECS but are skipped during
	 * their execution phase.
	 *
	 * @returns True when the system is currently enabled.
	 */
	public get isEnabled(): boolean {
		return this.enabled;
	}

	/**
	 * Activates this system.
	 *
	 * The onEnable() lifecycle hook is invoked only when transitioning from
	 * the disabled state to the enabled state.
	 *
	 * Repeated calls while already enabled have no effect.
	 */
	public enable(): void {
		if (this.enabled) {
			return;
		}

		this.enabled = true;
		this.onEnable();
	}

	/**
	 * Deactivates this system.
	 *
	 * Required systems cannot be disabled through the normal system lifecycle
	 * because they remain active independently of scene transitions.
	 *
	 * The onDisable() lifecycle hook is invoked only when a scene-scoped
	 * system transitions from the enabled state to the disabled state.
	 *
	 * Repeated calls while already disabled have no effect.
	 */
	public disable(): void {
		if (this.scope === "required") {
			return;
		}

		if (!this.enabled) {
			return;
		}

		this.enabled = false;
		this.onDisable();
	}

	/**
	 * Executes update behavior for this system.
	 *
	 * The ECS invokes this method only for systems registered in the update
	 * phase and currently enabled.
	 *
	 * Subclasses assigned to the update phase may override this method to
	 * implement their frame-based behavior.
	 *
	 * @param deltaTime - Time elapsed since the previous frame, in seconds.
	 */
	public update(deltaTime: number): void {}

	/**
	 * Executes render behavior for this system.
	 *
	 * The ECS invokes this method only for systems registered in the render
	 * phase and currently enabled.
	 *
	 * Subclasses assigned to the render phase may override this method to
	 * implement their rendering behavior.
	 */
	public render(): void {}

	/**
	 * Called when this system transitions into the enabled state.
	 *
	 * Scene-scoped systems may override this hook to initialize temporary
	 * state or resources associated with their active lifecycle.
	 */
	protected onEnable(): void {}

	/**
	 * Called when this system transitions into the disabled state.
	 *
	 * Scene-scoped systems may override this hook to release temporary state
	 * or resources associated with their active lifecycle.
	 */
	protected onDisable(): void {}
}
