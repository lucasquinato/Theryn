/**
 * File: ECSManager.ts
 * Path: src/engine/ecs/
 */

import { System } from "e@ecs/System.js";

import type { Entity } from "e@ecs/Entity.js";
import type { Component, ComponentType } from "e@ecs/Component.js";

/**
 * Central manager responsible for ECS entities, components, and systems.
 *
 * Entities are represented by numeric identifiers while components are
 * stored by their concrete constructor type.
 *
 * Systems are registered according to their execution phase and are executed
 * only while enabled.
 */
export class ECSManager {
	/**
	 * Set containing every entity currently alive in the ECS.
	 */
	private readonly entities = new Set<Entity>();

	/**
	 * Component storage indexed first by component type and then by entity.
	 *
	 * Each concrete component class owns an independent storage bucket.
	 */
	private readonly components = new Map<ComponentType, Map<Entity, Component>>();

	/**
	 * Systems registered for the update phase.
	 */
	private readonly updateSystems: System[] = [];

	/**
	 * Systems registered for the render phase.
	 */
	private readonly renderSystems: System[] = [];

	/**
	 * Tracks every registered system instance.
	 *
	 * A specific system instance may only be registered once.
	 */
	private readonly systems = new Set<System>();

	/**
	 * Next numeric identifier assigned to a newly created entity.
	 *
	 * Entity identifiers are monotonically increasing and are not reused
	 * after destruction.
	 */
	private nextEntityID: Entity = 1;

	/**
	 * Creates a new entity.
	 *
	 * Entity identifiers are unique for the lifetime of this ECS instance
	 * and are not reused after the corresponding entity is destroyed.
	 *
	 * @returns Newly created entity identifier.
	 */
	public createEntity(): Entity {
		const entity = this.nextEntityID++;

		this.entities.add(entity);

		return entity;
	}

	/**
	 * Checks whether an entity currently exists in the ECS.
	 *
	 * @param entity - Entity identifier to inspect.
	 *
	 * @returns True when the entity is currently alive.
	 */
	public hasEntity(entity: Entity): boolean {
		return this.entities.has(entity);
	}

	/**
	 * Destroys an entity and removes all components attached to it.
	 *
	 * Destroying an entity permanently invalidates its identifier inside this
	 * ECS instance. The identifier will not be reused for another entity.
	 *
	 * @param entity - Entity to destroy.
	 *
	 * @throws {Error} If the entity does not exist.
	 */
	public destroyEntity(entity: Entity): void {
		this.assertEntityExists(entity);

		this.entities.delete(entity);

		for (const [componentType, storage] of this.components) {
			storage.delete(entity);

			if (storage.size === 0) {
				this.components.delete(componentType);
			}
		}
	}

	/**
	 * Adds a component instance to an entity.
	 *
	 * The component constructor acts as its runtime identity, allowing each
	 * entity to contain at most one component instance of each concrete type.
	 *
	 * @template T - Concrete component type being attached.
	 *
	 * @param entity - Entity receiving the component.
	 * @param component - Component instance to attach.
	 *
	 * @returns The attached component instance.
	 *
	 * @throws {Error} If the entity does not exist.
	 * @throws {Error} If the entity already contains the same component type.
	 */
	public addComponent<T extends Component>(entity: Entity, component: T): T {
		this.assertEntityExists(entity);

		const componentType = component.constructor as ComponentType<T>;

		let storage = this.components.get(componentType);

		if (!storage) {
			storage = new Map<Entity, Component>();

			this.components.set(componentType, storage);
		}

		if (storage.has(entity)) {
			throw new Error(`Entity ${entity} already contains component "${componentType.name}".`);
		}

		storage.set(entity, component);

		return component;
	}

	/**
	 * Returns a component attached to an entity.
	 *
	 * @template T - Concrete component type being requested.
	 *
	 * @param entity - Entity containing the component.
	 * @param componentType - Concrete component class to resolve.
	 *
	 * @returns The component instance, or undefined when the entity does not
	 * contain the requested component type.
	 *
	 * @throws {Error} If the entity does not exist.
	 */
	public getComponent<T extends Component>(
		entity: Entity,
		componentType: ComponentType<T>,
	): T | undefined {
		this.assertEntityExists(entity);

		const storage = this.components.get(componentType);

		return storage?.get(entity) as T | undefined;
	}

	/**
	 * Checks whether an entity contains a specific component type.
	 *
	 * @template T - Concrete component type being inspected.
	 *
	 * @param entity - Entity to inspect.
	 * @param componentType - Concrete component class to search for.
	 *
	 * @returns True when the entity contains the requested component.
	 *
	 * @throws {Error} If the entity does not exist.
	 */
	public hasComponent<T extends Component>(
		entity: Entity,
		componentType: ComponentType<T>,
	): boolean {
		this.assertEntityExists(entity);

		return this.components.get(componentType)?.has(entity) ?? false;
	}

	/**
	 * Removes a component from an entity.
	 *
	 * Removing a component that is not attached to the entity has no effect.
	 * Empty component storage buckets are discarded automatically.
	 *
	 * @template T - Concrete component type being removed.
	 *
	 * @param entity - Entity losing the component.
	 * @param componentType - Concrete component class to remove.
	 *
	 * @throws {Error} If the entity does not exist.
	 */
	public removeComponent<T extends Component>(
		entity: Entity,
		componentType: ComponentType<T>,
	): void {
		this.assertEntityExists(entity);

		const storage = this.components.get(componentType);

		if (!storage) {
			return;
		}

		storage.delete(entity);

		if (storage.size === 0) {
			this.components.delete(componentType);
		}
	}

	/**
	 * Finds every entity containing all requested component types.
	 *
	 * Queries operate on the current ECS state and return only entities that
	 * are alive when the query executes.
	 *
	 * When no component types are provided, every alive entity is returned.
	 *
	 * For multi-component queries, the smallest matching component storage is
	 * used as the candidate set before testing the remaining storages.
	 *
	 * @param componentTypes - Component classes required by the query.
	 *
	 * @returns Entities containing every requested component type.
	 */
	public query(...componentTypes: readonly ComponentType[]): Entity[] {
		if (componentTypes.length === 0) {
			return [...this.entities];
		}

		const storages = componentTypes.map((componentType) => this.components.get(componentType));

		if (storages.some((storage) => !storage)) {
			return [];
		}

		const availableStorages = storages as Map<Entity, Component>[];

		const smallestStorage = availableStorages.reduce((smallest, current) =>
			current.size < smallest.size ? current : smallest,
		);

		const entities: Entity[] = [];

		for (const entity of smallestStorage.keys()) {
			const matchesEveryStorage = availableStorages.every((storage) => storage.has(entity));

			if (matchesEveryStorage) {
				entities.push(entity);
			}
		}

		return entities;
	}

	/**
	 * Registers a system in the ECS.
	 *
	 * The system is stored according to its execution phase.
	 *
	 * Required systems are enabled by their own lifecycle contract when they
	 * are created. Scene-scoped systems remain disabled until activated by
	 * their owning scene lifecycle.
	 *
	 * @param system - System instance to register.
	 *
	 * @throws {Error} If the same system instance is already registered.
	 */
	public registerSystem(system: System): void {
		if (this.systems.has(system)) {
			throw new Error("System instance is already registered.");
		}

		this.systems.add(system);

		switch (system.phase) {
			case "update":
				this.updateSystems.push(system);
				break;

			case "render":
				this.renderSystems.push(system);
				break;
		}
	}

	/**
	 * Enables a registered system.
	 *
	 * Scene-scoped systems become active through this method when their scene
	 * enters. Required systems are already enabled, making repeated enable
	 * requests harmless.
	 *
	 * @param system - Registered system to enable.
	 *
	 * @throws {Error} If the system is not registered.
	 */
	public enableSystem(system: System): void {
		this.assertSystemRegistered(system);

		system.enable();
	}

	/**
	 * Disables a registered system.
	 *
	 * Scene-scoped systems become inactive through this method when their
	 * scene exits. Required systems ignore disable requests by design.
	 *
	 * @param system - Registered system to disable.
	 *
	 * @throws {Error} If the system is not registered.
	 */
	public disableSystem(system: System): void {
		this.assertSystemRegistered(system);

		system.disable();
	}

	/**
	 * Executes all enabled update-phase systems.
	 *
	 * Systems execute in the same order in which they were registered.
	 *
	 * @param deltaTime - Time elapsed since the previous frame, in seconds.
	 */
	public update(deltaTime: number): void {
		for (const system of this.updateSystems) {
			if (!system.isEnabled) {
				continue;
			}

			system.update(deltaTime);
		}
	}

	/**
	 * Executes all enabled render-phase systems.
	 *
	 * Systems execute in the same order in which they were registered.
	 */
	public render(): void {
		for (const system of this.renderSystems) {
			if (!system.isEnabled) {
				continue;
			}

			system.render();
		}
	}

	/**
	 * Ensures an entity exists before an ECS operation is performed.
	 *
	 * @param entity - Entity identifier to validate.
	 *
	 * @throws {Error} If the entity is not alive.
	 */
	private assertEntityExists(entity: Entity): void {
		if (!this.entities.has(entity)) {
			throw new Error(`Entity ${entity} does not exist.`);
		}
	}

	/**
	 * Ensures a system has been registered before a lifecycle operation is
	 * performed on it.
	 *
	 * @param system - System instance to validate.
	 *
	 * @throws {Error} If the system is not registered.
	 */
	private assertSystemRegistered(system: System): void {
		if (!this.systems.has(system)) {
			throw new Error("System is not registered in this ECS.");
		}
	}
}

/**
 * Shared ECS runtime exposed by the engine.
 *
 * The engine currently uses a single ECSManager instance so entities,
 * components, and systems remain part of the same runtime across scene
 * transitions.
 */
export const ECSManagerInstance = new ECSManager();
