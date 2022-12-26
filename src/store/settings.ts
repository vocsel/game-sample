import { atom, useAtom } from "jotai";

export const Settings = atom({
  camera: "first-face",
});

export const useSettings = () => useAtom(Settings);
