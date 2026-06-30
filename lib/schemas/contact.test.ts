import { describe, expect, it } from "vitest";

import { ContactFormSchema } from "./contact";

describe("ContactFormSchema", () => {
  const base = {
    name: "Ada",
    email: "ada@example.com",
    message: "Hello there, this is a message.",
  };

  it("accepts valid input", () => {
    expect(ContactFormSchema.safeParse(base).success).toBe(true);
  });
  it("rejects invalid email", () => {
    expect(ContactFormSchema.safeParse({ ...base, email: "nope" }).success).toBe(false);
  });
  it("rejects short messages", () => {
    expect(ContactFormSchema.safeParse({ ...base, message: "hi" }).success).toBe(false);
  });
  it("rejects filled honeypot", () => {
    expect(ContactFormSchema.safeParse({ ...base, company: "spam" }).success).toBe(false);
  });
});
