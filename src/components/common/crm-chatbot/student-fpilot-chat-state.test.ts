import { describe, expect, it } from "vitest";
import {
  initialStudentFpilotChatState,
  reduceStudentFpilotChatState,
} from "./student-fpilot-chat-state";

describe("student Fpilot chat lifecycle", () => {
  it("keeps the same session when minimizing and restoring", () => {
    const opened = reduceStudentFpilotChatState(
      initialStudentFpilotChatState,
      {
        type: "open",
        session: {
          studentId: "HS-1",
          studentName: "Nguyễn An",
          canReadStudent: true,
          opening: 101,
        },
      },
    );

    const minimized = reduceStudentFpilotChatState(opened, {
      type: "minimize",
    });
    const restored = reduceStudentFpilotChatState(minimized, {
      type: "expand",
    });

    expect(minimized.mode).toBe("minimized");
    expect(restored.mode).toBe("expanded");
    expect(restored.session).toBe(opened.session);
  });

  it("reopens the same student without replacing the active session", () => {
    const active = {
      mode: "minimized" as const,
      session: {
        studentId: "HS-1",
        studentName: "Nguyễn An",
        canReadStudent: true,
        opening: 101,
      },
    };

    const reopened = reduceStudentFpilotChatState(active, {
      type: "open",
      session: {
        ...active.session,
        opening: 202,
      },
    });

    expect(reopened.mode).toBe("expanded");
    expect(reopened.session).toBe(active.session);
  });

  it("refuses to replace another active student or close a newer session", () => {
    const active = {
      mode: "expanded" as const,
      session: {
        studentId: "HS-1",
        studentName: "Nguyễn An",
        canReadStudent: true,
        opening: 101,
      },
    };

    expect(
      reduceStudentFpilotChatState(active, {
        type: "open",
        session: {
          studentId: "HS-2",
          studentName: "Trần Bình",
          canReadStudent: true,
          opening: 202,
        },
      }),
    ).toBe(active);
    expect(
      reduceStudentFpilotChatState(active, {
        type: "close-approved",
        opening: 99,
      }),
    ).toBe(active);
  });
});
