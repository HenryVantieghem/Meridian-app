import { describe, it, expect } from "vitest";
import { isEmail } from "./utils";

describe("isEmail", () => {
  it("returns true for valid email", () => {
    expect(isEmail("test@example.com")).toBe(true);
  });
  it("returns false for invalid email", () => {
    expect(isEmail("not-an-email")).toBe(false);
  });
});
