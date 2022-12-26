import {
  ArcRotateCamera, Mesh, MeshBuilder, Ray, Vector3,
} from "@babylonjs/core";
import Renderer from "../renderer";

export class ThirdFacePlayer {
  public readonly camera: ArcRotateCamera;

  public player: Mesh;

  constructor() {
    this.camera = ThirdFacePlayer.initializeCamera();

    this.initCharacter();
  }

  private static initializeCamera(): ArcRotateCamera {
    const renderer = Renderer.shared();

    const camera = new ArcRotateCamera("ThirdFaceCamera", Math.PI / 2, Math.PI / 6, 10, new Vector3(0, -5, 0), renderer.scene);
    camera.lowerRadiusLimit = 7;
    camera.upperRadiusLimit = 20;
    // camera.lowerAlphaLimit = Math.PI;
    // camera.upperAlphaLimit = Math.PI;
    camera.lowerBetaLimit = Math.PI / 8;
    camera.upperBetaLimit = Math.PI * 0.52;
    camera.attachControl(true);

    return camera;
  }

  isGrounded() {
    const renderer = Renderer.shared();
  
    let raycastFloorPos = new Vector3(
      this.player.position.x + offsetx,
      this.player.position.y + 0.5,
      this.player.position.z + offsetz
    );
    let ray = new Ray(raycastFloorPos, Vector3.Up().scale(-1), raycastlen);

    let predicate = function (mesh) {
      return mesh.isPickable && mesh.isEnabled();
    }

    let pick = renderer.scene.pickWithRay(ray, predicate);

    if (pick.hit) { 
      return pick.pickedPoint;
    } else { 
        return Vector3.Zero();
    }
  }

  async initCharacter() {
    const renderer = Renderer.shared();

    // const character = await renderer.importMesh("run.glb");
    const character = MeshBuilder.CreateCapsule("player", { height: 2, radius: 0.5 });
    this.player = character;
    this.player.checkCollisions = true;
    this.player.position.y = 1;

    let isJump = false;
    const velocity = new Vector3();

    renderer.scene.registerBeforeRender(() => {
      const delta = renderer.scene.getEngine().getDeltaTime();

      if (isJump) {
        velocity.y = 0.5;
      }

      if (this.isGrounded()) {
        console.log('>>>>>>')
      }

      velocity.y -= delta / 1000;

      unit.moveWithCollisions(velocity);

      const camDir = this.camera.getForwardRay().direction;

      if (renderer.inputs.w) {
        unit.moveWithCollisions(new Vector3(camDir.x, 0, camDir.z));
      }

      if (renderer.inputs.s) {
        unit.moveWithCollisions(new Vector3(-camDir.x, 0, -camDir.z));
      }

      if (renderer.inputs.a) {
        unit.moveWithCollisions(new Vector3(-camDir.z, 0, camDir.x));
      }

      if (renderer.inputs.d) {
        unit.moveWithCollisions(new Vector3(camDir.z, 0, -camDir.x));
      }
    });

    this.camera.target = unit;

    window.addEventListener("keydown", (e) => {
      console.log(e);
      if (e.code === "Space") {
        isJump = true;
      }

      // switch (e.inputIndex) {
      //   case 87:
      //     char.meshes[0].position.z += 1;
      //     break;
      //   case 83:
      //     char.meshes[0].position.z -= 1;
      //     break;
      //   case 68:
      //     // char.meshes[0].position.x += 1;
      //     char.meshes[0].rotation = new Vector3(0, -Math.PI / 2, 0);
      //     break;
      //   case 65:
      //     // char.meshes[0].position.x -= 1;
      //     char.meshes[0].rotation = new Vector3(0, Math.PI / 2, 0);
      //     break;
      // }
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "Space") {
        isJump = false;
      }
    });
  }
}
