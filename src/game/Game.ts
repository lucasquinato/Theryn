/**
 * File: Game.ts
 * Path: src/game/
 */

import { SceneData } from "g@scenes/SceneData.js";
import { Lobby } from "g@scenes/lobby/SceneLobby.js";
import { Forest } from "g@scenes/forest/SceneForest.js";
import { RenderMapSystem } from "g@systems/RenderMapSystem.js";

Theryn.scene.register(new Lobby());
Theryn.scene.register(new Forest());

Theryn.ecs.registerSystem(
	new RenderMapSystem(Theryn.ecs, Theryn.loader, Theryn.canvas.getCanvas("main")),
);

Theryn.scene.change(SceneData.lobby.name);
Theryn.scene.ready();
