export type StudentFpilotChatMode = "closed" | "expanded" | "minimized";

export interface StudentFpilotChatSession {
  studentId: string;
  studentName: string;
  canReadStudent: boolean;
  opening: number;
}

export interface StudentFpilotChatState {
  mode: StudentFpilotChatMode;
  session: StudentFpilotChatSession | null;
}

export type StudentFpilotChatAction =
  | { type: "open"; session: StudentFpilotChatSession }
  | { type: "minimize" }
  | { type: "expand" }
  | { type: "close-approved"; opening: number };

export const initialStudentFpilotChatState: StudentFpilotChatState = {
  mode: "closed",
  session: null,
};

export function reduceStudentFpilotChatState(
  state: StudentFpilotChatState,
  action: StudentFpilotChatAction,
): StudentFpilotChatState {
  switch (action.type) {
    case "open": {
      if (state.session) {
        return state.session.studentId === action.session.studentId
          ? { ...state, mode: "expanded" }
          : state;
      }
      return { mode: "expanded", session: action.session };
    }
    case "minimize":
      return state.mode === "expanded"
        ? { ...state, mode: "minimized" }
        : state;
    case "expand":
      return state.mode === "minimized"
        ? { ...state, mode: "expanded" }
        : state;
    case "close-approved":
      return state.session?.opening === action.opening
        ? initialStudentFpilotChatState
        : state;
    default:
      return state;
  }
}
