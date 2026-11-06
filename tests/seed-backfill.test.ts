import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/firebase/admin", () => ({ db: () => { throw new Error("not used"); } }));

const { missingMedia } = await import("@/lib/data");

describe("missingMedia", () => {
  it("adds a recap video the database does not have yet", () => {
    expect(missingMedia({ name: "Sprezzatura" }, { video: "/events/mora.mp4", videoLoop: "/events/mora-loop.mp4" })).toEqual({
      video: "/events/mora.mp4",
      videoLoop: "/events/mora-loop.mp4",
    });
  });

  it("never overwrites a value already set", () => {
    expect(missingMedia({ video: "/a.mp4", videoLoop: "/a-loop.mp4" }, { video: "/b.mp4", videoLoop: "/b-loop.mp4" })).toEqual({});
  });

  it("ignores other fields", () => {
    expect(missingMedia({}, { name: "X", heroImage: "/x.jpg" })).toEqual({});
  });
});
