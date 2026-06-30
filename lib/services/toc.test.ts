import { describe, expect, it } from "vitest";

import { extractToc } from "./toc";

describe("extractToc", () => {
  it("extracts h2/h3 and ignores fenced code", () => {
    const md = [
      "## First Heading",
      "text",
      "```",
      "## not a heading",
      "```",
      "### Sub Heading",
      "# title ignored",
    ].join("\n");
    const toc = extractToc(md);
    expect(toc).toEqual([
      { depth: 2, text: "First Heading", id: "first-heading" },
      { depth: 3, text: "Sub Heading", id: "sub-heading" },
    ]);
  });
});
