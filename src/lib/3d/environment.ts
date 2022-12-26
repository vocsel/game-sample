import {
  HemisphericLight, Mesh, MeshBuilder, PhysicsImpostor, StandardMaterial, Vector3,
  PhysicsHelper,
} from "@babylonjs/core";
import { PhysicsViewer } from "@babylonjs/core/Debug";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import Renderer from "./renderer";

let physicsViewer; let
  physicsHelper;

function makeSkybox() {
  const renderer = Renderer.shared();

  const box = MeshBuilder.CreateBox("", { size: 5 }, renderer.scene);
  box.position = new Vector3(10, 1, 10);
  box.physicsImpostor = new PhysicsImpostor(
    box,
    PhysicsImpostor.BoxImpostor,
    { mass: 1 },
    renderer.scene,
  );
  const skybox = MeshBuilder.CreateBox("skyBox", { size: 100.0 }, renderer.scene);
  const skyboxMaterial = new StandardMaterial("skyBox", renderer.scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new CubeTexture("skybox", renderer.scene);
  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
  skyboxMaterial.specularColor = new Color3(0, 0, 0);
  skybox.material = skyboxMaterial;
}

function makePhysicsObject(newMeshes, scaling = 1) {
  const { scene } = Renderer.shared();
  const physicsRoot = newMeshes[0];

  newMeshes.slice(1).forEach((m) => {
    m.scaling.x = Math.abs(m.scaling.x);
    m.scaling.y = Math.abs(m.scaling.y);
    m.scaling.z = Math.abs(m.scaling.z);
    m.physicsImpostor = new PhysicsImpostor(
      m,
      PhysicsImpostor.MeshImpostor,
      { mass: 0, friction: 0.5, restitution: 0.7 },
      scene,
    );
  });

  physicsRoot.scaling.scaleInPlace(scaling);
  physicsRoot.physicsImpostor = new PhysicsImpostor(
    physicsRoot,
    PhysicsImpostor.NoImpostor,
    { mass: 0 },
    scene,
  );
}

export default async function () {
  const renderer = Renderer.shared();

  physicsViewer = new PhysicsViewer();
  physicsHelper = new PhysicsHelper(renderer.scene);

  renderer.scene.useRightHandedSystem = true;

  const light = new HemisphericLight("sun", new Vector3(0.5, 0.7, 0), renderer.scene);

  // var ground = MeshBuilder.CreateGround("Ground", 1, renderer.scene);
  // ground.checkCollisions = true;
  // ground.scaling = new Vector3(300, 1, 300);
  // const mat = new StandardMaterial("mat", renderer.scene);
  // mat.alpha = 0;
  // ground.material = mat;
  // ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, renderer.scene);

  const importedScene = await renderer.importMesh("scene.glb");
  // importedScene.meshes[0].position.y -= 9000;
  // importedScene.meshes.forEach((m) => {
  //   m.checkCollisions = true;
  // });
  // makePhysicsObject(importedScene.meshes);
}
