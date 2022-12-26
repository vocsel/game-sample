import {
  ArcRotateCamera, Color3, FreeCamera, Mesh, MeshBuilder, Ray, RayHelper, StandardMaterial, Vector3,
} from "@babylonjs/core";
import Renderer from "../renderer";

let renderer;

export class ThirdFaceStaticPlayer {
  public readonly camera: ArcRotateCamera;

  public player: Mesh;

  constructor() {
    renderer = Renderer.shared();

    this.camera = ThirdFaceStaticPlayer.initializeCamera();

    this.initCharacter();
  }

  private static initializeCamera(): ArcRotateCamera {
    const camera = new ArcRotateCamera(
      "ThirdFaceCamera",
      Math.PI,
      Math.PI / 6,
      10,
      new Vector3(0, -5, 0),
      renderer.scene,
    );
    // camera.lowerRadiusLimit = 7;
    // camera.upperRadiusLimit = 20;
    // // camera.lowerAlphaLimit = Math.PI;
    // // camera.upperAlphaLimit = Math.PI;
    // camera.lowerBetaLimit = Math.PI / 8;
    // camera.upperBetaLimit = Math.PI * 0.52;
    camera.attachControl(true);

    return camera;
  }

  isGrounded(): { isGrounded: boolean } {
    const origin = new Vector3(
      this.player.position.x,
      this.player.position.y - 1,
      this.player.position.z,
    );

    const direction = new Vector3(0, -1, 0);

    const ray = new Ray(origin, new Vector3(direction.x, direction.y, direction.z), 0.2);

    // const rayHelper = new RayHelper(ray);
    // rayHelper.show(renderer.scene);

    const predicate = function (mesh) {
      return mesh.isPickable && mesh.isEnabled() && mesh.id !== "player";
    };

    const hit = renderer.scene.pickWithRay(ray, predicate);

    const _isGrounded = !!hit.pickedMesh;

    return { isGrounded: _isGrounded };
  }

  async initCharacter() {
    const character = MeshBuilder.CreateCapsule("player", { height: 2, radius: 0.5 });
    const mat = new StandardMaterial("player");
    mat.diffuseColor = new Color3(0, 0, 0);
    character.material = mat;
    this.player = character;
    // const character = await renderer.importMesh("run.glb");
    // character.meshes[0].showBoundingBox = true;
    // this.player = character.meshes[0];
    this.player.checkCollisions = true;
    this.player.position.y = 1;

    let needToJump = false;
    const move = new Vector3();

    renderer.scene.registerBeforeRender(() => {
      const delta = renderer.scene.getEngine().getDeltaTime();

      move.x = 0;
      move.z = 0;

      const { isGrounded } = this.isGrounded();

      if (needToJump && isGrounded) {
        move.y = 2;
      }

      if (!isGrounded) {
        move.y -= delta / 500;
      } else if (!needToJump) {
        move.y = 0;
      }

      const camDir = this.camera.getForwardRay().direction;

      if (renderer.inputs.w) {
        move.x = camDir.x;
        move.z = camDir.z;
      }

      if (renderer.inputs.s) {
        move.x = -camDir.x;
        move.z = -camDir.z;
      }

      if (renderer.inputs.a) {
        move.x = -camDir.z;
        move.z = camDir.x;
      }

      if (renderer.inputs.d) {
        move.x = camDir.z;
        move.z = -camDir.x;
      }

      this.player.moveWithCollisions(move);
    });

    this.camera.target = this.player;

    window.addEventListener("keydown", (e) => {
      // console.log(e);
      if (e.code === "Space") {
        needToJump = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "Space") {
        needToJump = false;
      }
    });
  }
}
