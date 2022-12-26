import "@babylonjs/loaders/glTF";
import {
  Engine,
  Scene,
  Vector3,
  SceneLoader,
  Mesh,
  AbstractMesh,
  ActionManager,
  ExecuteCodeAction,
  CannonJSPlugin,
  HavokPlugin,
} from "@babylonjs/core";
import * as cannon from "cannon";
import { getFileExtension } from "lib/helpers";
import { ScenePerformancePriority } from "@babylonjs/core/scene";
import HavokPhysics from "@babylonjs/havok";
import { FirstFacePlayer } from "./player/first-face-player";
import { ThirdFaceFreePlayer } from "./player/third-face-free-player";
import { ThirdFaceStaticPlayer } from "./player/third-face-static-player";

window.CANNON = cannon;

export default class Renderer {
  public static instance: Renderer;

  public scene: Scene;

  public canvas: HTMLCanvasElement;

  public engine: Engine;

  public player: FirstFacePlayer | ThirdFaceFreePlayer | ThirdFaceStaticPlayer;

  public objects: Array<Mesh|AbstractMesh> = [];

  public canJump: boolean;

  public inputs: Record<string, boolean>;

  private listeners: Record<string, ((arg: any) => void)[]> = {};

  public static shared() {
    if (!Renderer.instance) {
      Renderer.instance = new Renderer();
    }

    return Renderer.instance;
  }

  async init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.engine = new Engine(canvas, true, undefined, false);

    this.scene = new Scene(this.engine);

    // const hkInstance = await HavokPhysics();

    // const hkPlugin = new HavokPlugin(true, hkInstance);
    const cannonPlugin = new CannonJSPlugin();

    this.scene.enablePhysics(null, cannonPlugin);

    this.scene.performancePriority = ScenePerformancePriority[
      process.env.production ? "Intermediate" : "BackwardCompatible"
    ];

    // this.switchCameraType();

    this.setUpCamera();

    this.inputs = {};
    this.registerInputs();

    if (process.env.NODE_ENV === "debug") {
      this.scene.debugLayer.show({
        embedMode: true,
      });

      this.scene.debugLayer.show();
    }

    return this;
  }

  registerInputs() {
    this.scene.actionManager = new ActionManager(this.scene);

    this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (e) => {
      this.inputs[e.sourceEvent.code] = e.sourceEvent.type === "keydown";
    }));

    this.scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (e) => {
      this.inputs[e.sourceEvent.code] = e.sourceEvent.type === "keydown";
    }));
  }

  enableControls() {
    this.scene.onPointerDown = (e) => {
      if (e.button === 0) this.engine.enterPointerlock();
      if (e.button === 1) this.engine.exitPointerlock();

      // this.emitEvent("pointerLock", !e.button);
    };

    const framesPerSecond = 60;

    const gravity = -9.81;

    this.scene.gravity = new Vector3(0, gravity / framesPerSecond, 0);

    this.scene.collisionsEnabled = true;
  }

  setUpCamera() {
    this.enableControls();
  }

  importMesh(path: string) {
    const ext = getFileExtension(path) || ".glb";

    return SceneLoader.ImportMeshAsync("", "", path, this.scene, undefined, ext);
  }

  switchCameraType(camType = "first-face") {
    this.scene.cameras?.forEach((cam) => cam.dispose());
    this.scene.getMeshById("player")?.dispose();

    switch (camType) {
      case "first-face":
        this.player = new FirstFacePlayer();
        break;
      case "third-face-free":
        this.player = new ThirdFaceFreePlayer();
        break;
      case "third-face-static":
        this.player = new ThirdFaceStaticPlayer();
        break;
      default:
        break;
    }
  }

  run() {
    const lastTime = 0;

    const names = ["Eiffel-Tower", "Empire-State-Building"];

    const collidableMeshes = this.scene.meshes.filter((m) => names.includes(m.name));

    this.engine.runRenderLoop(() => {
      this.scene.render();

      // const t = Date.now();

      // if (t - lastTime >= 1000) {
      //   lastTime = t;

      //   collidableMeshes.forEach((_mesh: Mesh) => {
      //     const mesh = _mesh.getAbsolutePosition();

      //     const player = this.player.camera.position;

      //     const d = Math.sqrt((mesh.x - player.x) ** 2 + (mesh.z - player.z) ** 2);

      //     if (d < 1500) {
      //       // _mesh.setEnabled(true);
      //       _mesh.checkCollisions = true;
      //     } else {
      //       // _mesh.setEnabled(false);
      //       _mesh.checkCollisions = false;
      //     }
      //   });
      // }
    });

    window.addEventListener("resize", () => this.engine.resize());
  }

  emitEvent(event: string, value: any): void {
    this.listeners[event].forEach((cb) => cb(value));
  }

  on(event: string, cb: (args: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(cb);
  }
}
