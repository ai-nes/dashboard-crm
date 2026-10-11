export type StudentFpilotChatMode = "closed" | "compact" | "expanded";

export interface StudentFpilotChatSession {
  studentId: string;
  studentName: string;
  canReadStudent: boolean;
  opening: number;
}

export interface StudentFpilotChatState {
  mode: StudentFpilotChatMode;
  session: StudentFpilotChatSession | null;
  hasOpened: boolean;
}

export type StudentFpilotChatAction =
  | { type: "open-general" }
  | { type: "open-student"; session: StudentFpilotChatSession }
  | { type: "minimize" }
  | { type: "expand" }
  | { type: "close" }
  | { type: "close-approved"; opening: number };

export const initialStudentFpilotChatState: StudentFpilotChatState = {
  mode: "closed",
  session: null,
  hasOpened: false,
};

export function reduceStudentFpilotChatState(
  state: StudentFpilotChatState,
  action: StudentFpilotChatAction,
): StudentFpilotChatState {
  switch (action.type) {
    case "open-general":
      return state.mode === "closed"
        ? { ...state, mode: "compact", hasOpened: true }
        : state;
    case "open-student": {
      const mode = state.mode === "closed" ? "expanded" : state.mode;
      if (state.session?.studentId === action.session.studentId) {
        return { ...state, mode, hasOpened: true };
      }
      return { ...state, mode, session: action.session, hasOpened: true };
    }
    case "minimize":
      return state.mode === "expanded" ? { ...state, mode: "compact" } : state;
    case "expand":
      return state.mode === "closed" ? state : { ...state, mode: "expanded" };
    case "close":
      return { ...state, mode: "closed", session: null };
    case "close-approved":
      return state.session?.opening === action.opening
        ? { ...state, mode: "closed", session: null }
        : state;
    default:
      return state;
  }
}
