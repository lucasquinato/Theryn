import { Lobby } from "g@scenes/lobby/SceneLobby.js";

Theryn.scene.register(new Lobby());

Theryn.scene.change(Lobby.name);
Theryn.scene.ready();
