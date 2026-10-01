// Sample tasks for the data-table block. Made up; replace with your own.

export type TaskStatus = "backlog" | "todo" | "in-progress" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  label: "Feature" | "Bug" | "Docs";
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
};

export const STATUS: Record<TaskStatus, { label: string; tone: "neutral" | "info" | "warning" | "success" | "danger" }> = {
  backlog: { label: "Backlog", tone: "neutral" },
  todo: { label: "To do", tone: "info" },
  "in-progress": { label: "In progress", tone: "warning" },
  done: { label: "Done", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

export const PRIORITY: Record<TaskPriority, string> = { low: "Low", medium: "Medium", high: "High" };

const PEOPLE = ["Jane Cooper", "Wade Warren", "Esther Howard", "Cameron Williamson", "Brooklyn Simmons"];
const TITLES = [
  "Add dark mode to the settings page",
  "Fix the date picker on small screens",
  "Write the onboarding guide",
  "Export invoices as CSV",
  "Retry failed webhook deliveries",
  "Document the billing API",
  "Speed up the project list",
  "Show who is viewing a task",
  "Fix rounding in the revenue chart",
  "Add keyboard shortcuts to the inbox",
  "Archive projects after 90 days",
  "Clean up unused email templates",
  "Let admins resend an invite",
  "Fix focus loss after saving a form",
  "Translate the sign-in screens",
  "Add a weekly summary email",
];
const STATUSES: TaskStatus[] = ["in-progress", "todo", "backlog", "done", "todo", "cancelled", "in-progress", "done"];
const PRIORITIES: TaskPriority[] = ["high", "medium", "low", "medium"];
const LABELS: Task["label"][] = ["Feature", "Bug", "Docs", "Feature"];

export const TASKS: Task[] = TITLES.map((title, i) => ({
  id: `TASK-${8740 + i * 7}`,
  title,
  label: title.startsWith("Fix") ? "Bug" : title.startsWith("Write") || title.startsWith("Document") ? "Docs" : LABELS[i % LABELS.length],
  status: STATUSES[i % STATUSES.length],
  priority: PRIORITIES[(i * 3) % PRIORITIES.length],
  assignee: PEOPLE[(i * 2) % PEOPLE.length],
}));
