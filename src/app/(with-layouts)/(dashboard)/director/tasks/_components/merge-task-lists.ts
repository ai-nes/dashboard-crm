import type { CRMTask } from "@/services/api/crm-tasks";

/** Status queries can overlap while a task moves between lanes. */
export function mergeTaskLists(lists: readonly (readonly CRMTask[])[]): CRMTask[] {
  const tasks = new Map<string, CRMTask>();

  for (const list of lists) {
    for (const task of list) {
      const previous = tasks.get(task.name);
      // CRM timestamps use a sortable year-month-day format. On equal or
      // missing timestamps, prefer the later snapshot without moving the card.
      if (!previous || (task.modified ?? "") >= (previous.modified ?? "")) {
        tasks.set(task.name, task);
      }
    }
  }

  return [...tasks.values()];
}
