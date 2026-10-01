import type { Metadata } from "next";
import Link from "next/link";
import styles from "../_docs/Docs.module.css";
import { DocsShell } from "../_docs/DocsShell";
import { Foundations } from "./Foundations";

export const metadata: Metadata = {
  title: "Foundations",
};

const TOC = [
  { id: "type", label: "Type" },
  { id: "shape", label: "Radius and shadow" },
  { id: "motion", label: "Motion" },
  { id: "icons", label: "Icons" },
];

export default function FoundationsPage() {
  return (
    <DocsShell current="foundations" toc={TOC}>
      <h1 className={styles.title}>Foundations</h1>
      <p className={styles.lede}>
        Type, radius, shadow, motion and icons, read live from this page in the current preset and mode. Colours have their
        own page: <Link href="/colors">Colors</Link>.
      </p>
      <Foundations />
    </DocsShell>
  );
}
