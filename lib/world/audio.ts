import {
  playOneShot,
  setAudioMasterVolume,
  setAudioMuted,
  unlockAudioEngine,
} from "@/lib/audio/html-audio";
import { AUDIO } from "@/lib/audio/paths";

const VOL = {
  click: 0.7,
  chime: 0.75,
  dialogue: 0.4,
  boxOpen: 0.8,
  reveal: 0.75,
  metaSwell: 0.65,
  transition: 0.55,
} as const;
export function unlockAudio(): void {
  unlockAudioEngine();
}
export function setMuted(value: boolean): void {
  setAudioMuted(value);
}
export function setSfxVolume(scale: number): void {
  setAudioMasterVolume(scale);
}
function play(id: keyof typeof AUDIO.sfx, volume: number): void {
  playOneShot(AUDIO.sfx[id], volume);
}
export const sfx = {
  click: (): void => play("click", VOL.click),
  step: (): void => play("click", 0.35),
  chime: (): void => play("chime", VOL.chime),
  jump: (): void => play("chime", 0.45),
  dialogue: (): void => play("dialogue", VOL.dialogue),
  boxOpen: (): void => play("boxOpen", VOL.boxOpen),
  reveal: (): void => play("reveal", VOL.reveal),
  metaSwell: (): void => play("metaSwell", VOL.metaSwell),
  transition: (): void => play("transition", VOL.transition),
};
