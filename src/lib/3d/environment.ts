import {
  HemisphericLight, Mesh, MeshBuilder, PhysicsImpostor, StandardMaterial, Vector3,
  PhysicsHelper, Vector2,
} from "@babylonjs/core";
import { PhysicsViewer } from "@babylonjs/core/Debug";
import { CubeTexture } from "@babylonjs/core/Materials/Textures/cubeTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { WaterMaterial } from "@babylonjs/materials";
import { CAMERA } from "lib/constants";
import Renderer from "./renderer";

let physicsViewer; let
  physicsHelper;

function makeSkybox() {
  const renderer = Renderer.shared();

  const skybox = MeshBuilder.CreateBox("skyBox", { size: CAMERA.MAXZ * 0.99 }, renderer.scene);
  const skyboxMaterial = new StandardMaterial("skyBox", renderer.scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.reflectionTexture = new CubeTexture("skybox", renderer.scene);
  skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
  skyboxMaterial.specularColor = new Color3(0, 0, 0);
  skybox.material = skyboxMaterial;
}

function makeWater() {
  const renderer = Renderer.shared();

  const waterMesh = MeshBuilder.CreateGround("waterMesh", {
    width: 2048, height: 2048, subdivisions: 16, updatable: false,
  }, renderer.scene);
  const water = new WaterMaterial("water", renderer.scene, new Vector2(512, 512));
  water.backFaceCulling = true;
  water.bumpTexture = new Texture("textures/waterbump.png", renderer.scene);
  water.windForce = -10;
  water.waveHeight = 1.7;
  water.bumpHeight = 0.1;
  water.windDirection = new Vector2(1, 1);
  water.waterColor = new Color3(0, 0, 221 / 255);
  water.colorBlendFactor = 0.0;
  waterMesh.material = water;
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
  makeSkybox();
  // makeWater();

  const renderer = Renderer.shared();

  physicsViewer = new PhysicsViewer();
  physicsHelper = new PhysicsHelper(renderer.scene);

  renderer.scene.useRightHandedSystem = true;

  const light = new HemisphericLight("sun", new Vector3(0.5, 0.7, 0), renderer.scene);
  light.intensity = 1;
  // var ground = MeshBuilder.CreateGround("Ground", 1, renderer.scene);
  // ground.checkCollisions = true;
  // ground.scaling = new Vector3(300, 1, 300);
  // const mat = new StandardMaterial("mat", renderer.scene);
  // mat.alpha = 0;
  // ground.material = mat;
  // ground.physicsImpostor = new PhysicsImpostor(ground, PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, renderer.scene);

  const importedScene = await renderer.importMesh("scene.glb");
  // importedScene.meshes[0].position.y -= 9000;
  importedScene.meshes.forEach((m) => {
    m.checkCollisions = true;
    if (["Ground", "EXPORT_GOOGLE_SAT_WM"].includes(m.name)) {
      m.checkCollisions = true;
    }
  });
  // makePhysicsObject(importedScene.meshes);
}
