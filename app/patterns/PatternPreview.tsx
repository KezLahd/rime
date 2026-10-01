"use client";

import type { ReactNode } from "react";
import { Button, Card, Meter, Modal } from "@/components/ui";
import { cx } from "@/components/ui/_internal/cx";
import { Example } from "../_docs/Example";
import { PREVIEWS } from "../_docs/previews";
import { SignInFlow, TermsGatedInline } from "../_docs/previews/flows";
import local from "./Patterns.module.css";
import { SHELL_PATTERN_PREVIEWS } from "./shell-previews";

// Live specimens for the patterns, each shown in one example frame with
// Preview | Code tabs. A pattern is a composed page, so it fills the frame
// at its real width: no inner centring box.
const ON_FIELD = new Set(["list-page", "summary-card"]);

const RENDERS: Record<string, () => ReactNode> = {
  "list-page": () => PREVIEWS["filter-bar"]?.default?.() ?? null,
  "glass-shell": () => <GlassShell />,
  "summary-card": () => <SummaryCard />,
  "modal-scroll": () => <ModalScroll />,
  "terms-gated": () => <TermsGatedInline />,
  "sign-in": () => <SignInFlow />,
  ...SHELL_PATTERN_PREVIEWS,
};

export function PatternExample({
  slug,
  name,
  summary,
  description,
  code,
}: {
  slug: string;
  name: string;
  summary: string;
  description: string[];
  code: string;
}) {
  const render = RENDERS[slug];
  return (
    <Example
      id={slug}
      headingLevel={2}
      title={name}
      block
      code={code}
      className={local.example}
      description={
        <>
          <p className={local.summary}>{summary}</p>
          {description.map((d, i) => (
            <p key={i} className={local.desc}>
              {d}
            </p>
          ))}
        </>
      }
    >
      <div className={cx(local.preview, ON_FIELD.has(slug) && local.onField)}>{render ? render() : null}</div>
    </Example>
  );
}

function GlassShell() {
  const shell = PREVIEWS["sidebar-shell"];
  return (
    <div className={local.pair}>
      <div>
        <p className={local.caption}>Logo corner: match glass (the default)</p>
        {shell?.default?.()}
      </div>
      <div>
        <p className={local.caption}>Logo corner: brand fill (opt in, for brands that require it)</p>
        {shell?.fill?.()}
      </div>
    </div>
  );
}

const CELLS = [
  { label: "Invoices paid", value: "32", note: "+4 on last month" },
  { label: "Active projects", value: "14", note: "3 due this week" },
  { label: "Revenue", value: "$48.2k", note: "Target: $45k" },
  { label: "Median time to pay", value: "6 days", note: "Down from 9" },
];

function SummaryCard() {
  return (
    <Card title="This month" description="Updated hourly">
      <dl className={local.cells}>
        {CELLS.map((c) => (
          <div key={c.label} className={local.cell}>
            <dt className={local.cellLabel}>{c.label}</dt>
            <dd className={local.cellValue}>{c.value}</dd>
            <p className={local.cellNote}>{c.note}</p>
          </div>
        ))}
      </dl>
      <div className={local.meter}>
        <Meter label="Seats" value={3} max={5} valueText="3 of 5 seats used" />
      </div>
    </Card>
  );
}

const TERMS = Array.from({ length: 10 }, (_, i) => (
  <p key={i}>
    {i + 1}. These terms cover use of the workspace during the trial period. Each member keeps their sign-in to themselves,
    stores project files only in the shared drive, and removes client data when a project closes.
  </p>
));

/** The modal as it sits over a page: a field the full width, the dialog open on it. Scroll its body. */
function ModalScroll() {
  return (
    <div className={local.modalField}>
      <Modal
        inline
        open
        onClose={() => {}}
        size="lg"
        title="Workspace terms"
        description="Scroll the body: the header shade arrives once content passes under it."
        className={local.modalPanel}
        footer={<Button>I agree</Button>}
      >
        {TERMS}
      </Modal>
    </div>
  );
}
