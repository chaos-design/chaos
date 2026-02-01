import fs from "node:fs/promises";
import path from "node:path";
import { ChangelogEntry } from "./changelog-entry";

type ChangelogFromFileProps = {
  path: string;
};

type ChangelogSection = {
  title: string;
  version?: string;
  date?: string;
  bodyLines: string[];
};

function parseHeader(header: string) {
  const normalized = header.trim();
  
  // Match "0.0.22 2026-01-31"
  const newFormatMatch = /^(\S+)\s+(\d{4}-\d{2}-\d{2})$/.exec(normalized);
  if (newFormatMatch) {
    return {
      title: normalized,
      version: newFormatMatch[1],
      date: newFormatMatch[2],
    };
  }

  const cleanHeader = normalized.replace(/^\[|\]$/g, "");
  const match =
    /^([^-]+?)(?:\s*-\s*(.+))?$/.exec(cleanHeader);
  const version = match?.[1]?.trim();
  const date = match?.[2]?.trim();
  return {
    title: cleanHeader,
    version,
    date,
  };
}

function parseSections(content: string): ChangelogSection[] {
  const sections = content
    .split(/^##\s+/m)
    .map((section) => section.trim())
    .filter(Boolean);

  return sections.map((section) => {
    const [rawHeader, ...rest] = section.split("\n");
    const { title, version, date } = parseHeader(rawHeader ?? "");
    return {
      title,
      version,
      date,
      bodyLines: rest,
    };
  });
}

function renderBody(lines: string[]) {
  const nodes: React.ReactNode[] = [];
  let buffer: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (buffer.length === 0) return;
    nodes.push(<p key={`p-${nodes.length}`}>{buffer.join(" ").trim()}</p>);
    buffer = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`}>
        {listItems.map((item, index) => (
          <li key={`li-${nodes.length}-${index}`}>{item}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }
    if (trimmed.startsWith("- ")) {
      flushParagraph();
      listItems.push(trimmed.replace(/^-+\s*/, ""));
      return;
    }
    buffer.push(trimmed);
  });

  flushParagraph();
  flushList();

  return nodes;
}

export async function ChangelogFromFile({ path: filePath }: ChangelogFromFileProps) {
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);
  let content = "";
  try {
    content = await fs.readFile(resolvedPath, "utf8");
  } catch {
    return (
      <div className="text-sm text-foreground/70">
        未找到 Changelog 文件：{resolvedPath}
      </div>
    );
  }

  const sections = parseSections(content);

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-10">
      {sections.map((section, index) => (
        <ChangelogEntry
          key={`${section.title}-${index}`}
          date={section.date ?? "未提供日期"}
          version={section.version}
          title={section.title}
        >
          <div className="prose dark:prose-invert prose-sm">
            {renderBody(section.bodyLines)}
          </div>
        </ChangelogEntry>
      ))}
    </div>
  );
}
