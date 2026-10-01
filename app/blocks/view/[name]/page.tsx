import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOCKS, BLOCK_COMPONENTS } from "@/components/blocks";
import { PreviewClickGuard } from "./PreviewClickGuard";
import { ThemeSync } from "./ThemeSync";

// One block, full page, no docs chrome: what the /blocks viewer shows in its
// iframe, and what the block looks like at its route in a project.

type Props = { params: Promise<{ name: string }> };

export function generateStaticParams() {
  return BLOCKS.map((b) => ({ name: b.name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const meta = BLOCKS.find((b) => b.name === name);
  return { title: meta ? `${meta.title} block` : "Block" };
}

export default async function BlockView({ params }: Props) {
  const { name } = await params;
  const Block = BLOCK_COMPONENTS[name];
  if (!Block) notFound();
  return (
    <>
      <ThemeSync />
      <PreviewClickGuard />
      <Block />
    </>
  );
}
