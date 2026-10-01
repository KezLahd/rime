"use client";

import { Archive, File, Inbox as InboxIcon, Send, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { Badge, CountBadge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { cx } from "@/components/ui/_internal/cx";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/Resizable/Resizable";
import { SearchField } from "@/components/ui/SearchField/SearchField";
import { Switch } from "@/components/ui/Switch/Switch";
import { SegmentedControl } from "@/components/ui/Tabs/Tabs";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { useToast } from "@/components/ui/Toast/Toast";
import { FOLDERS, MESSAGES, type Folder, type Message } from "./data";
import styles from "./Inbox.module.css";

const ICONS: Record<Folder, ReactNode> = {
  inbox: <InboxIcon size={16} aria-hidden="true" />,
  drafts: <File size={16} aria-hidden="true" />,
  sent: <Send size={16} aria-hidden="true" />,
  archive: <Archive size={16} aria-hidden="true" />,
  trash: <Trash2 size={16} aria-hidden="true" />,
};

export type InboxProps = {
  /** Fill the parent instead of the viewport. */
  contained?: boolean;
};

/**
 * Inbox block: a mail-style app in three resizable panes. Folders on the
 * left, the message list with search and an All / Unread switch in the
 * middle, and the open message with a reply box on the right. Drop it at
 * app/inbox.
 */
export default function Inbox({ contained }: InboxProps) {
  const toast = useToast();
  const [messages, setMessages] = useState(() => MESSAGES.map((m) => (m.id === "m1" ? { ...m, unread: false } : m)));
  const [folder, setFolder] = useState<Folder>("inbox");
  const [view, setView] = useState<"all" | "unread">("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>("m1");
  const [reply, setReply] = useState("");
  const [mute, setMute] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter(
      (m) =>
        m.folder === folder &&
        (view === "all" || m.unread) &&
        (!q || m.from.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.preview.toLowerCase().includes(q)),
    );
  }, [messages, folder, view, query]);

  const open = messages.find((m) => m.id === openId) ?? null;
  const unreadIn = (f: Folder) => messages.filter((m) => m.folder === f && m.unread).length;

  const select = (m: Message) => {
    setOpenId(m.id);
    setMessages((all) => all.map((x) => (x.id === m.id ? { ...x, unread: false } : x)));
  };
  const moveTo = (to: Folder) => {
    if (!open) return;
    setMessages((all) => all.map((x) => (x.id === open.id ? { ...x, folder: to } : x)));
    setOpenId(null);
    toast.success(to === "archive" ? "Archived" : "Moved to trash");
  };

  return (
    <div className={cx(styles.root, contained && styles.contained)}>
      <ResizablePanelGroup height="100%" className={styles.group}>
        <ResizablePanel defaultSize={20} minSize={14}>
          <nav aria-label="Mail folders" className={styles.folders}>
            <p className={styles.brand}>
              <span className={styles.glyph} aria-hidden="true">
                A
              </span>
              Acme Mail
            </p>
            <ul className={styles.folderList}>
              {FOLDERS.map((f) => (
                <li key={f.id}>
                  <button type="button" className={styles.folder} aria-current={folder === f.id ? "page" : undefined} onClick={() => setFolder(f.id)}>
                    {ICONS[f.id]}
                    <span className={styles.folderLabel}>{f.label}</span>
                    {unreadIn(f.id) ? <CountBadge count={unreadIn(f.id)} label={`${unreadIn(f.id)} unread`} /> : null}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize folders" />
        <ResizablePanel defaultSize={36} minSize={24}>
          <section aria-label="Messages" className={styles.listPane}>
            <div className={styles.listHead}>
              <h2 className={styles.h2}>{FOLDERS.find((f) => f.id === folder)?.label}</h2>
              <SegmentedControl
                aria-label="Show"
                size="sm"
                value={view}
                onChange={setView}
                options={[
                  { value: "all", label: "All" },
                  { value: "unread", label: "Unread" },
                ]}
              />
            </div>
            <div className={styles.search}>
              <SearchField aria-label="Search mail" size="sm" value={query} onValueChange={setQuery} placeholder="Search mail" />
            </div>
            <ul className={styles.messages}>
              {list.map((m) => (
                <li key={m.id}>
                  <button type="button" className={styles.message} aria-current={openId === m.id ? "true" : undefined} onClick={() => select(m)}>
                    <span className={styles.messageTop}>
                      <span className={cx(styles.from, m.unread && styles.unread)}>
                        {m.unread ? <span className={styles.dot} aria-label="Unread" /> : null}
                        {m.from}
                      </span>
                      <span className={styles.date}>{m.date}</span>
                    </span>
                    <span className={styles.subject}>{m.subject}</span>
                    <span className={styles.preview}>{m.preview}</span>
                    {m.label ? (
                      <span>
                        <Badge tone={m.label === "Billing" ? "warning" : m.label === "Team" ? "info" : "neutral"}>{m.label}</Badge>
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
            {list.length === 0 ? <EmptyState compact title="Nothing here" description={query ? "No messages match your search." : "This folder is empty."} /> : null}
          </section>
        </ResizablePanel>
        <ResizableHandle aria-label="Resize message list" />
        <ResizablePanel defaultSize={44} minSize={28}>
          {open ? (
            <article aria-label={open.subject} className={styles.detail}>
              <div className={styles.toolbar}>
                <IconButton label="Archive" icon={<Archive size={16} />} onClick={() => moveTo("archive")} />
                <IconButton label="Move to trash" icon={<Trash2 size={16} />} onClick={() => moveTo("trash")} />
              </div>
              <header className={styles.detailHead}>
                <Avatar name={open.from} tone="neutral" />
                <div className={styles.detailMeta}>
                  <p className={styles.detailFrom}>{open.from}</p>
                  <p className={styles.detailEmail}>{open.email}</p>
                </div>
                <span className={styles.date}>{open.date}</span>
              </header>
              <h3 className={styles.detailSubject}>{open.subject}</h3>
              <div className={styles.body}>
                {open.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <form
                className={styles.reply}
                onSubmit={(e) => {
                  e.preventDefault();
                  setReply("");
                  toast.success("Reply sent", { description: `To ${open.from}` });
                }}
              >
                <Textarea aria-label={`Reply to ${open.from}`} rows={3} value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Reply to ${open.from}`} />
                <div className={styles.replyFoot}>
                  <Switch label="Mute this thread" checked={mute} onChange={setMute} />
                  <Button type="submit" size="sm" disabled={!reply.trim()}>
                    Send
                  </Button>
                </div>
              </form>
            </article>
          ) : (
            <div className={styles.detailEmpty}>
              <EmptyState compact title="No message open" description="Pick a message from the list to read it here." />
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
