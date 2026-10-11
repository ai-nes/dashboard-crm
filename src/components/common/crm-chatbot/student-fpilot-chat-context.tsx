"use client";

import { toast } from "sonner";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  initialStudentFpilotChatState,
  reduceStudentFpilotChatState,
  type StudentFpilotChatSession,
  type StudentFpilotChatState,
} from "./student-fpilot-chat-state";

interface OpenStudentFpilotChatInput {
  studentId: string;
  studentName: string;
  canReadStudent: boolean;
}

interface StudentFpilotChatContextValue extends StudentFpilotChatState {
  isActive: boolean;
  openStudentChat: (input: OpenStudentFpilotChatInput) => void;
  minimizeStudentChat: () => void;
  expandStudentChat: () => void;
  closeApprovedStudentChat: (opening: number) => void;
}

const StudentFpilotChatContext =
  createContext<StudentFpilotChatContextValue | null>(null);

export function StudentFpilotChatProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    reduceStudentFpilotChatState,
    initialStudentFpilotChatState,
  );
  const lastOpening = useRef(0);

  const openStudentChat = useCallback(
    ({ studentId, studentName, canReadStudent }: OpenStudentFpilotChatInput) => {
      const normalizedStudentId = studentId.trim();
      if (!canReadStudent || !normalizedStudentId) return;

      if (state.session && state.session.studentId !== normalizedStudentId) {
        toast.info(
          `Đang có cuộc trò chuyện Fpilot với ${state.session.studentName}. Hãy đóng phiên đó trước khi tra cứu học sinh khác.`,
        );
        return;
      }

      let session: StudentFpilotChatSession;
      if (state.session) {
        session = state.session;
      } else {
        lastOpening.current = Math.max(Date.now(), lastOpening.current + 1);
        session = {
          studentId: normalizedStudentId,
          studentName: studentName.trim() || "học sinh này",
          canReadStudent,
          opening: lastOpening.current,
        };
      }
      dispatch({ type: "open", session });
    },
    [state.session],
  );

  const minimizeStudentChat = useCallback(
    () => dispatch({ type: "minimize" }),
    [],
  );
  const expandStudentChat = useCallback(
    () => dispatch({ type: "expand" }),
    [],
  );
  const closeApprovedStudentChat = useCallback(
    (opening: number) => dispatch({ type: "close-approved", opening }),
    [],
  );

  const value = useMemo<StudentFpilotChatContextValue>(
    () => ({
      ...state,
      isActive: state.mode !== "closed" && state.session !== null,
      openStudentChat,
      minimizeStudentChat,
      expandStudentChat,
      closeApprovedStudentChat,
    }),
    [
      state,
      openStudentChat,
      minimizeStudentChat,
      expandStudentChat,
      closeApprovedStudentChat,
    ],
  );

  return (
    <StudentFpilotChatContext.Provider value={value}>
      {children}
    </StudentFpilotChatContext.Provider>
  );
}

export function useStudentFpilotChat() {
  const context = useContext(StudentFpilotChatContext);
  if (!context) {
    throw new Error(
      "useStudentFpilotChat must be used inside StudentFpilotChatProvider",
    );
  }
  return context;
}
