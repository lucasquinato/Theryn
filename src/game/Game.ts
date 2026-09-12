/**
 * File: Game.ts
 * Path: src/game/
 */

import { Player } from "g@components/Player.js";
import { Sprite } from "g@components/Sprite.js";
import { Animator } from "g@components/Animator.js";
import { GridPosition } from "g@components/GridPosition.js";

import { IsometricProjection } from "g@render/IsometricProjection.js";

import { SceneData } from "g@scenes/SceneData.js";
import { Lobby } from "g@scenes/lobby/SceneLobby.js";
import { Forest } from "g@scenes/forest/SceneForest.js";

import { HoverState } from "g@interaction/HoverState.js";

import { Tiles } from "g@tiles/data/Tiles.js";

import { HoverSystem } from "g@systems/HoverSystem.js";
import { RenderMapSystem } from "g@systems/RenderMapSystem.js";
import { AnimationSystem } from "g@systems/AnimationSystem.js";
import { RenderHoverSystem } from "g@systems/RenderHoverSystem.js";
import { CameraFollowSystem } from "g@systems/CameraFollowSystem.js";
import { RenderCharacterSystem } from "g@systems/RenderCharacterSystem.js";

const projection = new IsometricProjection(32, 16);
const hover = new HoverState();
const canvas = Theryn.canvas.getCanvas("main");

Theryn.camera.setZoom(2);

Theryn.scene.register(new Lobby());
Theryn.scene.register(new Forest());

Theryn.ecs.registerSystem(new AnimationSystem(Theryn.ecs, Theryn.loader));

Theryn.ecs.registerSystem(new CameraFollowSystem(Theryn.ecs, Theryn.camera, projection));

Theryn.ecs.registerSystem(
	new RenderMapSystem(
		Theryn.ecs,
		Theryn.loader,
		canvas,
		Theryn.camera,
		Theryn.renderQueue,
		projection,
	),
);

Theryn.ecs.registerSystem(
	new RenderCharacterSystem(
		Theryn.ecs,
		Theryn.loader,
		canvas,
		Theryn.camera,
		Theryn.renderQueue,
		projection,
	),
);

Theryn.ecs.registerSystem(
	new HoverSystem(Theryn.ecs, Theryn.input.mouse, Theryn.camera, projection, Tiles, hover),
);

Theryn.ecs.registerSystem(
	new RenderHoverSystem(canvas, Theryn.camera, Theryn.renderQueue, projection, hover),
);

const player = Theryn.ecs.createEntity();

Theryn.ecs.addComponent(player, new Player());

Theryn.ecs.addComponent(player, new GridPosition(3, 3));

Theryn.ecs.addComponent(player, new Sprite("hana", 10, 0, 10));

Theryn.ecs.addComponent(player, new Animator("idle", "rightDown"));

Theryn.scene.change(SceneData.lobby.name);
Theryn.scene.ready();
