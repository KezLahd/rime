import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { CodeBlock } from "../../_docs/CodeBlock";
import styles from "../../_docs/Docs.module.css";
import { DocsShell } from "../../_docs/DocsShell";
import { InstallCommand } from "../../_docs/Install";

export const metadata: Metadata = { title: "AI agents" };

const TOC = [
  { id: "read", label: "What an agent reads" },
  { id: "project", label: "In your project" },
  { id: "mcp", label: "The MCP server" },
  { id: "prompt", label: "A good prompt" },
];

export default function AiAgents() {
  return (
    <DocsShell current="/docs/ai" toc={TOC}>
      <h1 className={styles.title}>AI agents</h1>
      <p className={styles.lede}>
        Every page is rendered from one typed registry, and the same content is served as markdown, so an agent reads exactly what
        you see.
      </p>

      <section className={styles.section} id="read" aria-labelledby="read-h">
        <h2 id="read-h" className={styles.h2}>
          What an agent reads
        </h2>
        <ul className={styles.list}>
          <li>
            <Link href="/llms.txt" prefetch={false}>
              /llms.txt
            </Link>
            : the index, the rules, the shadcn name map and install lines. Start here.
          </li>
          <li>
            <Link href="/llms-full.txt" prefetch={false}>
              /llms-full.txt
            </Link>
            : every component, pattern and rule in one file.
          </li>
          <li>
            The markdown twin of any page: add .md (<code className={styles.inlineCode}>/components/button.md</code>), or use the
            Copy page menu at the top of every component page, which also opens the page in Claude.
          </li>
          <li>{SITE.url}/r/registry.json: the registry, for the shadcn CLI and MCP.</li>
        </ul>
      </section>

      <section className={styles.section} id="project" aria-labelledby="project-h">
        <h2 id="project-h" className={styles.h2}>
          In your project
        </h2>
        <p className={styles.note}>
          The agents item adds docs/ui (llms.txt and llms-full.txt), a Rime skill for Claude Code (.claude/skills/rime) and
          AGENTS.rime.md. Add one line to your AGENTS.md: &quot;UI: follow AGENTS.rime.md.&quot;
        </p>
        <InstallCommand items={["agents"]} label="Install the agent docs" />
      </section>

      <section className={styles.section} id="mcp" aria-labelledby="mcp-h">
        <h2 id="mcp-h" className={styles.h2}>
          The MCP server
        </h2>
        <p className={styles.note}>
          With the {SITE.namespace} namespace in components.json (see Installation), the shadcn MCP server lists, searches and installs
          Rime items and returns their examples:
        </p>
        <CodeBlock language="text" label=".mcp.json" code={`{ "mcpServers": { "shadcn": { "command": "npx", "args": ["shadcn@latest", "mcp"] } } }`} />
      </section>

      <section className={styles.section} id="prompt" aria-labelledby="prompt-h">
        <h2 id="prompt-h" className={styles.h2}>
          A good prompt
        </h2>
        <CodeBlock
          language="text"
          label="Prompt"
          code={`Read docs/ui/llms.txt (or ${SITE.url}/llms.txt) first and follow its rules.
Build only with Rime components and tokens. If a component is missing from
components/ui, install it with the shadcn CLI rather than writing one.`}
        />
      </section>
    </DocsShell>
  );
}
