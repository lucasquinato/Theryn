/**
 * File: Component.ts
 * Path: src/engine/ecs/
 */

/**
 * Represents data that can be attached to an entity inside the ECS.
 *
 * Components are intended to store state only. Behavior should remain inside
 * systems that operate on entities containing the required component types.
 */
export type Component = object;

/**
 * Represents the constructor of a component class.
 *
 * Component constructors act as runtime identifiers inside the ECS. This
 * allows component storage and lookup to use the concrete class itself
 * instead of string keys or manually assigned identifiers.
 *
 * @template T - Concrete component type produced by the constructor.
 */
export type ComponentType<T extends Component = Component> = abstract new (...args: any[]) => T;
