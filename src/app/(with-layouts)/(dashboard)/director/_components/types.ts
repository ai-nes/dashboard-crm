export type WorkspaceTone = "primary" | "success" | "warning" | "error";

export interface WorkspaceMetric {
  label: string;
  value: string;
  detail: string;
  tone: WorkspaceTone;
}

export interface WorkspaceItem {
  label: string;
  detail: string;
  value?: string;
  tone?: WorkspaceTone;
}

export interface WorkspaceSection {
  title: string;
  description: string;
  items: WorkspaceItem[];
}

export interface DirectorWorkspacePageProps {
  code: string;
  title: string;
  description: string;
  metrics: WorkspaceMetric[];
  sections: WorkspaceSection[];
  notice?: string;
}
