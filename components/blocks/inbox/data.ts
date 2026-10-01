// Sample messages for the inbox block. Made up; replace with your own.

export type Folder = "inbox" | "drafts" | "sent" | "archive" | "trash";

export type Message = {
  id: string;
  folder: Folder;
  from: string;
  email: string;
  subject: string;
  preview: string;
  body: string[];
  date: string;
  unread: boolean;
  label?: "Work" | "Billing" | "Team";
};

export const FOLDERS: Array<{ id: Folder; label: string }> = [
  { id: "inbox", label: "Inbox" },
  { id: "drafts", label: "Drafts" },
  { id: "sent", label: "Sent" },
  { id: "archive", label: "Archive" },
  { id: "trash", label: "Trash" },
];

export const MESSAGES: Message[] = [
  {
    id: "m1",
    folder: "inbox",
    from: "Wade Warren",
    email: "wade@acme.example",
    subject: "Billing API: rollout plan",
    preview: "I have split the rollout into two steps so we can watch the error rate...",
    body: [
      "Hi Jane,",
      "I have split the rollout into two steps so we can watch the error rate before the second half goes live. The first step moves the read endpoints on Tuesday; writes follow on Thursday if nothing looks off.",
      "Could you check the customer-facing copy for the status page before Monday?",
      "Thanks, Wade",
    ],
    date: "09:42",
    unread: true,
    label: "Work",
  },
  {
    id: "m2",
    folder: "inbox",
    from: "Esther Howard",
    email: "esther@acme.example",
    subject: "Ember beta feedback",
    preview: "The first round of feedback is in. People love the offline mode...",
    body: ["The first round of feedback is in. People love the offline mode, and three testers asked for a dark theme.", "I have grouped the rest by screen in the doc. Shall we go through it on Wednesday?", "Esther"],
    date: "08:15",
    unread: true,
    label: "Team",
  },
  {
    id: "m3",
    folder: "inbox",
    from: "Billing",
    email: "billing@acme.example",
    subject: "Invoice INV-1042 was paid",
    preview: "Jane Cooper paid invoice INV-1042 for $1,280. The payout arrives in...",
    body: ["Jane Cooper paid invoice INV-1042 for $1,280.", "The payout arrives in your bank account within two working days."],
    date: "Yesterday",
    unread: false,
    label: "Billing",
  },
  {
    id: "m4",
    folder: "inbox",
    from: "Brooklyn Simmons",
    email: "brooklyn@acme.example",
    subject: "Beacon onboarding copy",
    preview: "Attached are two versions of the welcome screen. I prefer the shorter...",
    body: ["Attached are two versions of the welcome screen. I prefer the shorter one, but the longer one tested slightly better.", "Your call."],
    date: "Mon",
    unread: false,
    label: "Work",
  },
  {
    id: "m5",
    folder: "inbox",
    from: "Robert Fox",
    email: "robert@acme.example",
    subject: "Fjord analytics kickoff",
    preview: "Kickoff is booked for 9 November. I have shared the brief and the...",
    body: ["Kickoff is booked for 9 November. I have shared the brief and the data access request.", "Let me know if anyone else should join."],
    date: "Sun",
    unread: false,
    label: "Team",
  },
  {
    id: "m6",
    folder: "sent",
    from: "Jane Cooper",
    email: "jane@acme.example",
    subject: "Re: Quarterly review",
    preview: "Thanks all. Notes and next steps are in the shared drive...",
    body: ["Thanks all. Notes and next steps are in the shared drive."],
    date: "Fri",
    unread: false,
  },
  {
    id: "m7",
    folder: "drafts",
    from: "Jane Cooper",
    email: "jane@acme.example",
    subject: "Holiday cover",
    preview: "While I am away from the 20th, Wade will cover reviews...",
    body: ["While I am away from the 20th, Wade will cover reviews for Atlas and Beacon."],
    date: "Thu",
    unread: false,
  },
];
