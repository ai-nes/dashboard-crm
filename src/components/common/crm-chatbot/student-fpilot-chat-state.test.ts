import { describe, expect, it } from "vitest";
import {
  initialStudentFpilotChatState,
  reduceStudentFpilotChatState,
} from "./student-fpilot-chat-state";

describe("student Fpilot chat lifecycle", () => {
  it("opens the student context in the current panel size and preserves the host runtime after close", () => {
    const compact = reduceStudentFpilotChatState(initialStudentFpilotChatState, {
      type: "open-general",
    });
    const student = reduceStudentFpilotChatState(compact, {
      type: "open-student",
      session: {
        studentId: "HS-1",
        studentName: "Nguyễn An",
        canReadStudent: true,
        opening: 100,
      },
    });
    const closed = reduceStudentFpilotChatState(student, { type: "close" });

    expect(student.mode).toBe("compact");
    expect(closed.mode).toBe("closed");
    expect(closed.session).toBeNull();
    expect(closed.hasOpened).toBe(true);
  });

  it("opens a student lookup large only when the shared chat was closed", () => {
    const opened = reduceStudentFpilotChatState(initialStudentFpilotChatState, {
      type: "open-student",
      session: {
        studentId: "HS-1",
        studentName: "Nguyễn An",
        canReadStudent: true,
        opening: 100,
      },
    });

    expect(opened.mode).toBe("expanded");
  });

  it("keeps the same session when minimizing and restoring", () => {
    const opened = reduceStudentFpilotChatState(
      initialStudentFpilotChatState,
      {
        type: "open-student",
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

    expect(minimized.mode).toBe("compact");
    expect(restored.mode).toBe("expanded");
    expect(restored.session).toBe(opened.session);
  });

  it("reopens the same student without replacing the active session", () => {
    const active = {
      mode: "compact" as const,
      hasOpened: true,
      session: {
        studentId: "HS-1",
        studentName: "Nguyễn An",
        canReadStudent: true,
        opening: 101,
      },
    };

    const reopened = reduceStudentFpilotChatState(active, {
      type: "open-student",
      session: {
        ...active.session,
        opening: 202,
      },
    });

    expect(reopened.mode).toBe("compact");
    expect(reopened.session).toBe(active.session);
  });

  it("switches the active context to another student and ignores stale close replies", () => {
    const active = {
      mode: "expanded" as const,
      hasOpened: true,
      session: {
        studentId: "HS-1",
        studentName: "Nguyễn An",
        canReadStudent: true,
        opening: 101,
      },
    };

    expect(
      reduceStudentFpilotChatState(active, {
        type: "open-student",
        session: {
          studentId: "HS-2",
          studentName: "Trần Bình",
          canReadStudent: true,
          opening: 202,
        },
      }),
    ).toMatchObject({ session: { studentId: "HS-2" }, mode: "expanded" });
    expect(
      reduceStudentFpilotChatState(active, {
        type: "close-approved",
        opening: 99,
      }),
    ).toBe(active);
  });
});
