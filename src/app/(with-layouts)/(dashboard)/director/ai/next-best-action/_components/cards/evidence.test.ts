import { describe, expect, it } from "vitest";

import { friendlyEvidence } from "./evidence";

describe("friendlyEvidence", () => {
  it("maps known internal ref shapes to Vietnamese labels", () => {
    expect(
      friendlyEvidence([
        "student-context:revision:12:intent",
        "score-input:revision:3:score",
      ]),
    ).toEqual(["Nhu cầu quan tâm của học viên", "Điểm quan tâm của học viên"]);
  });

  it("drops an unrecognised internal-looking token", () => {
    expect(friendlyEvidence(["EV-1", "some-doc:revision:9:blob"])).toEqual([]);
  });

  it("passes through already-readable prose and de-dupes", () => {
    expect(
      friendlyEvidence([
        "Học viên đã xem thông tin ngành 3 lần",
        "Học viên đã xem thông tin ngành 3 lần",
      ]),
    ).toEqual(["Học viên đã xem thông tin ngành 3 lần"]);
  });
});
