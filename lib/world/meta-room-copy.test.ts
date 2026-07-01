import { describe, expect, it } from "vitest";

import {
  buildMetaOverlayBeats,
  metaBeatPop,
  metaCtaPanelOpacity,
  resolveMetaOverlayBeat,
} from "./meta-room-copy";

describe("meta-room-copy", () => {
  const contactBeats = [
    { at: 0, text: "Rooftop." },
    { at: 0.42, text: "If any of this felt familiar — let's talk." },
    { at: 0.62, text: "Email, GitHub, LinkedIn — one tap away." },
    { at: 0.82, text: "Life is a lot like a game. It depends how you play it." },
  ];

  it("starts with the room intro once the 3D scene is visible", () => {
    const beats = buildMetaOverlayBeats(contactBeats);
    expect(beats[0]?.title).toBe("This is my room.");
    expect(resolveMetaOverlayBeat(0.36, beats)?.title).toBe("This is my room.");
  });

  it("advances through contact beats during the pull-back", () => {
    const beats = buildMetaOverlayBeats(contactBeats);
    expect(resolveMetaOverlayBeat(0.45, beats)?.title).toBe("This is my room.");
    expect(resolveMetaOverlayBeat(0.8, beats)?.title).toContain("Life is a lot like a game");
  });

  it("ramps pop-in and CTA opacity with reveal progress", () => {
    const beats = buildMetaOverlayBeats(contactBeats);
    const intro = resolveMetaOverlayBeat(0.36, beats)!;
    expect(metaBeatPop(0.36, intro)).toBe(0);
    expect(metaBeatPop(0.42, intro)).toBeGreaterThan(0.5);
    expect(metaCtaPanelOpacity(0.52)).toBe(0);
    expect(metaCtaPanelOpacity(0.66)).toBeGreaterThan(0.5);
  });
});
