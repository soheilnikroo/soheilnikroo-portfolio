"use client";

import * as React from "react";

export function ChapterBlock({
  index,
  activeIndex,
  blockRefs,
  children,
}: {
  index: number;
  activeIndex: number;
  blockRefs: React.RefObject<(HTMLDivElement | null)[]>;
  children: React.ReactNode;
}) {
  return (
    <div
      ref={(el) => {
        blockRefs.current[index] = el;
      }}
      aria-hidden={activeIndex !== index}
      style={{ display: activeIndex === index ? undefined : "none" }}
      className="absolute inset-0"
    >
      {children}
    </div>
  );
}
