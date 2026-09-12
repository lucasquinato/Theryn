/**
 * File: Entity.ts
 * Path: src/engine/ecs/
 */

/**
 * Unique numeric identifier assigned to an entity by the ECS.
 *
 * An entity is intentionally represented only by its identifier and contains
 * no behavior or state by itself. Entity data is defined entirely by the
 * components attached to that identifier inside the ECS.
 *
 * Entity identifiers are managed by the ECSManager and remain unique for the
 * lifetime of its runtime instance.
 */
export type Entity = number;
