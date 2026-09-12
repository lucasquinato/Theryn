/**
 * File: Game.ts
 * Path: src/game/
 */

import { Sprite } from "g@components/Sprite.js";
import { Player } from "g@components/Player.js";
import { Animator } from "g@components/Animator.js";
import { Movement } from "g@components/Movement.js";
import { GridPosition } from "g@components/GridPosition.js";
import { WorldPosition } from "g@components/WorldPosition.js";

import { MovementConfig } from "g@config/MovementConfig.js";
import { InteractionConfig } from "g@config/InteractionConfig.js";

import { HanaSpriteSheet } from "g@assets/characters/Hana.js";

import { HoverState } from "g@interaction/HoverState.js";
import { WalkHintState } from "g@interaction/WalkHintState.js";
import { SelectionState } from "g@interaction/SelectionState.js";

import { GridCostField } from "g@navigation/GridCostField.js";
import { GridNavigation } from "g@navigation/GridNavigation.js";
import { GridPathfinder } from "g@navigation/GridPathfinder.js";
import { MovementRangeState } from "g@navigation/MovementRangeState.js";

import { IsometricProjection } from "g@render/IsometricProjection.js";

import { SceneData } from "g@scenes/SceneData.js";
import { Lobby } from "g@scenes/lobby/SceneLobby.js";
import { Forest } from "g@scenes/forest/SceneForest.js";

import { HoverSystem } from "g@systems/HoverSystem.js";
import { MovementSystem } from "g@systems/MovementSystem.js";
import { SelectionSystem } from "g@systems/SelectionSystem.js";
import { AnimationSystem } from "g@systems/AnimationSystem.js";
import { RenderMapSystem } from "g@systems/RenderMapSystem.js";
import { CameraZoomSystem } from "g@systems/CameraZoomSystem.js";
import { HoverEffectSystem } from "g@systems/HoverEffectSystem.js";
import { RenderHoverSystem } from "g@systems/RenderHoverSystem.js";
import { CameraFollowSystem } from "g@systems/CameraFollowSystem.js";
import { MovementRangeSystem } from "g@systems/MovementRangeSystem.js";
import { RenderWalkHintSystem } from "g@systems/RenderWalkHintSystem.js";
import { WalkHintEffectSystem } from "g@systems/WalkHintEffectSystem.js";
import { RenderCharacterSystem } from "g@systems/RenderCharacterSystem.js";
import { RenderSelectionSystem } from "g@systems/RenderSelectionSystem.js";
import { SelectionEffectSystem } from "g@systems/SelectionEffectSystem.js";

import { Tiles } from "g@tiles/data/Tiles.js";

const projection = new IsometricProjection(32, 16);
const canvas = Theryn.canvas.getCanvas("main");
const camera = Theryn.camera;
const hover = new HoverState();
const selection = new SelectionState();
const navigation = new GridNavigation(Theryn.ecs, Tiles);
const pathfinder = new GridPathfinder(navigation);
const costField = new GridCostField(navigation);
const movementRange = new MovementRangeState();
const walkHint = new WalkHintState();
Theryn.camera.setZoom(2);

Theryn.scene.register(new Lobby());

Theryn.scene.register(new Forest());

Theryn.ecs.registerSystem(
	new CameraZoomSystem(Theryn.input.mouse, Theryn.camera, InteractionConfig.cameraZoom),
);

Theryn.ecs.registerSystem(
	new HoverSystem(Theryn.ecs, Theryn.input.mouse, Theryn.camera, projection, navigation, hover),
);

Theryn.ecs.registerSystem(
	new SelectionSystem(
		Theryn.ecs,
		Theryn.input.mouse,
		hover,
		selection,
		movementRange,
		pathfinder,
	),
);

Theryn.ecs.registerSystem(
	new MovementSystem(Theryn.ecs, projection, selection, MovementConfig.movement),
);

Theryn.ecs.registerSystem(new AnimationSystem(Theryn.ecs, Theryn.loader));

Theryn.ecs.registerSystem(new CameraFollowSystem(Theryn.ecs, Theryn.camera));

Theryn.ecs.registerSystem(new HoverEffectSystem(hover, InteractionConfig.hover));

Theryn.ecs.registerSystem(new SelectionEffectSystem(selection, MovementConfig.selection));

Theryn.ecs.registerSystem(
	new RenderMapSystem(
		Theryn.ecs,
		Theryn.loader,
		canvas,
		Theryn.camera,
		Theryn.renderQueue,
		projection,
		hover,
	),
);

Theryn.ecs.registerSystem(
	new RenderSelectionSystem(
		canvas,
		Theryn.camera,
		Theryn.renderQueue,
		projection,
		selection,
		MovementConfig.selection,
	),
);

Theryn.ecs.registerSystem(
	new RenderHoverSystem(
		canvas,
		Theryn.camera,
		Theryn.renderQueue,
		projection,
		hover,
		InteractionConfig.hover,
	),
);

Theryn.ecs.registerSystem(
	new RenderCharacterSystem(Theryn.ecs, Theryn.loader, canvas, Theryn.camera, Theryn.renderQueue),
);

Theryn.ecs.registerSystem(
	new MovementRangeSystem(Theryn.ecs, costField, movementRange, MovementConfig.movement),
);

Theryn.ecs.registerSystem(
	new WalkHintEffectSystem(movementRange, walkHint, MovementConfig.walkHint),
);

Theryn.ecs.registerSystem(
	new RenderWalkHintSystem(
		canvas,
		camera,
		Theryn.renderQueue,
		projection,
		movementRange,
		walkHint,
		MovementConfig.walkHint,
	),
);

const player = Theryn.ecs.createEntity();

const playerGridPosition = new GridPosition(2, 2);
const playerWorldAnchor = projection.toWorldCenter(
	playerGridPosition.row,
	playerGridPosition.column,
);

Theryn.ecs.addComponent(player, new Player());
Theryn.ecs.addComponent(player, playerGridPosition);
Theryn.ecs.addComponent(player, new WorldPosition(playerWorldAnchor.x, playerWorldAnchor.y));
Theryn.ecs.addComponent(player, new Movement());
Theryn.ecs.addComponent(player, new Sprite(HanaSpriteSheet.key, 10, 0, 10));
Theryn.ecs.addComponent(player, new Animator("idle", "rightDown"));

Theryn.scene.change(SceneData.lobby.name);

Theryn.scene.ready();
