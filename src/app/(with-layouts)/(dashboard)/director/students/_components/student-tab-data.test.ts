import { describe, expect, it } from "vitest";

import { calls, resolveStudentCalls } from "./student-tab-data";

describe("local call demo seed", () => {
  it("contains the ten call UUIDs imported from the inbound report", () => {
    expect(calls).toHaveLength(10);
    expect(calls.map((call) => call.id)).toEqual([
      "1788095122.629019",
      "1788088431.627663",
      "1788086727.627182",
      "1788085260.626678",
      "1788084299.626492",
      "1788083167.626270",
      "1788082739.626189",
      "1788081890.626069",
      "1788081819.626054",
      "1788081658.626026",
    ]);
  });

  it("never replaces an explicitly returned call list", () => {
    const serverCalls = [calls[0]];

    expect(resolveStudentCalls(serverCalls)).toBe(serverCalls);
    expect(resolveStudentCalls([])).toEqual([]);
  });
});
