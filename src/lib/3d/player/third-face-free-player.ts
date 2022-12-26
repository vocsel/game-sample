import {
  ArcRotateCamera, Color3, MeshBuilder, StandardMaterial, Vector3,
} from "@babylonjs/core";
import { CharacterController } from "./character-controller";

export class ThirdFaceFreePlayer extends CharacterController {
  public readonly camera: ArcRotateCamera;

  constructor() {
    super({
      ray: {
        position: new Vector3(0, 0, 0),
        length: 0.2,
      },
    });

    this.camera = this.initializeCamera();

    this.initCharacter();
  }

  private initializeCamera(): ArcRotateCamera {
    const camera = new ArcRotateCamera("ThirdFaceCamera", Math.PI / 2, Math.PI / 6, 10, new Vector3(0, -5, 0), this.renderer.scene);
    camera.lowerRadiusLimit = 7;
    camera.upperRadiusLimit = 20;
    // camera.lowerAlphaLimit = Math.PI;
    // camera.upperAlphaLimit = Math.PI;
    camera.lowerBetaLimit = Math.PI / 8;
    camera.upperBetaLimit = Math.PI * 0.52;
    camera.attachControl(true);

    return camera;
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
    this.player.position.y = 5;

    const move = new Vector3();

    this.renderer.scene.registerBeforeRender(() => {
      const needToJump = this.renderer.inputs.Space;

      const delta = this.renderer.scene.getEngine().getDeltaTime();

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

      if (this.renderer.inputs.KeyW) {
        move.x = camDir.x;
        move.z = camDir.z;
      }

      if (this.renderer.inputs.KeyS) {
        move.x = -camDir.x;
        move.z = -camDir.z;
      }

      if (this.renderer.inputs.KeyA) {
        move.x = -camDir.z;
        move.z = camDir.x;
      }

      if (this.renderer.inputs.KeyD) {
        move.x = camDir.z;
        move.z = -camDir.x;
      }

      // move.x /= 2;
      // move.z /= 2;

      this.player.moveWithCollisions(move);
    });

    this.camera.target = this.player;
  }
}
