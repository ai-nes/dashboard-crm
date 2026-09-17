const legacyTabAliases: Record<string, string> = {
  family: "student-profile",
  profile: "student-profile",
  records: "admission",
  zalo: "interactions",
  calls: "interactions",
  log: "audit",
  activities: "interactions",
};

const supportedTabs = new Set([
  "decision",
  "student-profile",
  "academic-admission",
  "admission",
  "notes",
  "tasks",
  "interactions",
  "audit",
]);

export function getInitialStudentDetailTab(
  initialTab?: string,
  initialTaskId?: string,
): string {
  if (initialTaskId) return "tasks";

  const normalizedTab = initialTab
    ? legacyTabAliases[initialTab] || initialTab
    : undefined;

  return normalizedTab && supportedTabs.has(normalizedTab)
    ? normalizedTab
    : "decision";
}

export function shouldLoadInitialStudentInteractions(
  initialTab?: string,
  initialTaskId?: string,
): boolean {
  return (
    getInitialStudentDetailTab(initialTab, initialTaskId) === "interactions"
  );
}
