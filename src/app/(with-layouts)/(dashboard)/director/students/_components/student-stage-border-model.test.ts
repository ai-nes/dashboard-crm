import { describe, expect, it } from "vitest";
import type { StudentAuditLog } from "@/services/api/student-audit";
import { buildStudentStageBorder } from "./student-stage-border-model";

const event = (overrides: Partial<StudentAuditLog> = {}): StudentAuditLog => ({
  eventId: "stage-change",
  action: "updated",
  changeType: "changed",
  doctype: "CRM Student",
  docname: "STUDENT-1",
  fieldname: "student_stage",
  fieldLabel: "Student Stage",
  oldValue: "Connected",
  newValue: "Qualified",
  owner: "counselor@example.com",
  ownerFullName: "Nguyễn An",
  occurredAt: "2026-09-23 09:30:00",
  source: "Version",
  sourceName: "version-1",
  ...overrides,
});

describe("student stage border", () => {
  it("marks current progress and keeps future stages neutral", () => {
    expect(
      buildStudentStageBorder("Qualified", []).map(({ state }) => state),
    ).toEqual(["past", "past", "past", "current", "future", "future"]);
  });

  it("ends the disqualified branch without suggesting registration or enrollment", () => {
    const items = buildStudentStageBorder("Disqualified", []);
    expect(items.map(({ status }) => status)).toEqual([
      "New",
      "Attempting",
      "Connected",
      "Disqualified",
    ]);
    expect(items.at(-1)?.state).toBe("current");
  });

  it("uses the latest actual stage transition, excluding Lead and unrelated changes", () => {
    const latest = event();
    const logs = [
      event({ occurredAt: "2026-09-20 10:00:00" }),
      latest,
      event({ doctype: "CRM Lead", occurredAt: "2026-09-24 10:00:00" }),
      event({
        fieldname: "processing_status",
        occurredAt: "2026-09-24 10:00:00",
      }),
      event({ oldValue: "Qualified", occurredAt: "2026-09-24 10:00:00" }),
    ];
    expect(buildStudentStageBorder("Qualified", logs)[3].event).toBe(latest);
    expect(logs[0].occurredAt).toBe("2026-09-20 10:00:00");
  });

  it("does not invent times or actors for stages missing from loaded history", () => {
    expect(
      buildStudentStageBorder("New Enter", []).every((item) => !item.event),
    ).toBe(true);
  });
});
