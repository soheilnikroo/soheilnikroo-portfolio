"use client";
import * as React from "react";

import { createTapTracker } from "@/lib/engine";

function shouldIgnoreTapTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return true;
  return !!target.closest("a, button, [role='button'], input, textarea");
}

export function useTapGesture(
  onTap: (event: PointerEvent) => void,
  options?: { enabled?: boolean },
): {
  onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: React.PointerEvent<HTMLElement>) => void;
} {
  const onTapRef = React.useRef(onTap);
  const trackerRef = React.useRef(createTapTracker());
  const enabled = options?.enabled ?? true;

  onTapRef.current = onTap;

  return React.useMemo(
    () => ({
      onPointerDown(event: React.PointerEvent<HTMLElement>) {
        if (!enabled) return;
        trackerRef.current.onPointerDown(event.clientX, event.clientY, event.pointerId, {
          ignored: shouldIgnoreTapTarget(event.target),
        });
      },
      onPointerMove(event: React.PointerEvent<HTMLElement>) {
        if (!enabled) return;
        trackerRef.current.onPointerMove(event.clientX, event.clientY, event.pointerId);
      },
      onPointerUp(event: React.PointerEvent<HTMLElement>) {
        if (!enabled) return;
        if (!trackerRef.current.onPointerUp(event.clientX, event.clientY, event.pointerId)) {
          return;
        }
        if (shouldIgnoreTapTarget(event.target)) return;
        onTapRef.current(event.nativeEvent);
      },
      onPointerCancel(event: React.PointerEvent<HTMLElement>) {
        trackerRef.current.onPointerCancel(event.pointerId);
      },
    }),
    [enabled],
  );
}
