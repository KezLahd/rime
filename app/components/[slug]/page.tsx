import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { REGISTRY, entryBySlug, propTables, tokenRows } from "@/components/ui/_registry";
import { DocsShell } from "../../_docs/DocsShell";
import { neighbours } from "../../_docs/nav";
import type { TocItem } from "../../_docs/Toc";
import { installInfo } from "@/lib/registry-items";
import { ComponentDoc } from "./ComponentDoc";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = entryBySlug((await params).slug);
  return {
    title: entry ? entry.name : "Component",
    description: entry?.summary,
  };
}

// One page per registry entry at /components/<slug>, prerendered at build.
export function generateStaticParams() {
  return REGISTRY.map((e) => ({ slug: e.slug }));
}

export default async function ComponentPage({ params }: Props) {
  const entry = entryBySlug((await params).slug);
  if (!entry) notFound();
  const install = installInfo(entry.slug);
  const toc: TocItem[] = [
    ...(install ? [{ id: "installation", label: "Installation" }] : []),
    { id: "usage", label: "Usage" },
    ...(entry.composition ? [{ id: "composition", label: "Composition" }] : []),
    { id: "examples", label: "Examples" },
    ...entry.examples.map((ex) => ({ id: `example-${ex.id}`, label: ex.title, depth: 3 as const })),
    { id: "api", label: "API" },
    { id: "tokens", label: "Theme tokens" },
    { id: "accessibility", label: "Accessibility" },
    { id: "rules", label: "Do and don't" },
    { id: "for-ai", label: "For AI agents" },
  ];
  const { prev, next } = neighbours(`/components/${entry.slug}`);
  return (
    <DocsShell current={`/components/${entry.slug}`} toc={toc}>
      <ComponentDoc
        entry={entry}
        propTables={propTables(entry)}
        tokens={tokenRows(entry)}
        markdownHref={`/md/${entry.slug}.md`}
        install={install}
        prev={prev}
        next={next}
      />
    </DocsShell>
  );
}
