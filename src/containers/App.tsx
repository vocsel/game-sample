import React, { useEffect, useState } from "react";
import Renderer from "lib/3d/renderer";
import loadEnvironment from "lib/3d/environment";
import { useSettings } from "store/settings";
import Freezer from "components/Freezer";
import Spinner from "components/Spinner";

const App = () => {
  const [settings, setSettings] = useSettings();
  const [isInitialized, setIsInitialized] = useState(false);
  let canvas: HTMLCanvasElement;

  useEffect(() => {
    if (isInitialized) {
      const renderer = Renderer.shared();

      if (renderer.scene) {
        renderer.switchCameraType(settings.camera);
      }
    }
  }, [settings, isInitialized]);

  useEffect(() => {
    async function init() {
      const canvas = document.querySelector("canvas") as HTMLCanvasElement;

      const renderer = Renderer.shared();
      await renderer.init(canvas);
      renderer.switchCameraType(settings.camera);
      renderer.run();

      await loadEnvironment();

      setIsInitialized(true);
    }

    init();
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          zIndex: 2,
          left: 0,
          top: 0,
          width: "250px",
          padding: "5px",
          margin: "10px",
          backgroundColor: "rgba(0,0,0,0.8)",
          color: "#fff",
        }}
      >
        <form>
          <fieldset>
            <legend>Camera view:</legend>

            <div>
              <input
                type="radio"
                id="first-face"
                name="camera"
                value="first-face"
                checked={settings.camera === "first-face"}
                onChange={(e) => setSettings({ ...settings, camera: e.target.value })}
              />
              <label htmlFor="first-face">First-face camera</label>
            </div>

            <div>
              <input
                type="radio"
                id="third-face-free"
                name="camera"
                value="third-face-free"
                checked={settings.camera === "third-face-free"}
                onChange={(e) => setSettings({ ...settings, camera: e.target.value })}
              />
              <label htmlFor="third-face-free">Third-face free camera</label>
            </div>

            <div>
              <input
                type="radio"
                id="third-face-static"
                name="camera"
                value="third-face-static"
                checked={settings.camera === "third-face-static"}
                onChange={(e) => setSettings({ ...settings, camera: e.target.value })}
              />
              <label htmlFor="third-face-static">Third-face static camera</label>
            </div>
          </fieldset>
        </form>
      </div>
      <Freezer show={!isInitialized} message={!isInitialized ? <Spinner /> : null}>
        <canvas />
      </Freezer>
    </div>
  );
};

export default App;
