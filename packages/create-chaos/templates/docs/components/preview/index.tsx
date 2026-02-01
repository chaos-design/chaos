import { readFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";

import { siteConfig } from "@/fumadocs.config";
import { PreviewRender } from "./render";
import { PreviewShell } from "./shell";
import { registry as docsExamplesRegistry } from "@/examples";

const REPO_SHADCN_IMPORT_REGEX = /@\/components\/ui\//g;
const REPO_ROOT_IMPORT_REGEX = /@\//g;

type PreviewProps = {
  path: string;
  className?: string;
  type?: "component" | "block";
  wide?: boolean;
  width?: string | number;
  height?: string | number;
};

const FILE_EXTENSION_REGEX = /\.(tsx|ts|jsx|js)$/;

const previewConfig = siteConfig.preview ?? {
  sources: [
    {
      dir: "examples",
      importBase: "../../examples",
    },
  ],
};
type PreviewSource = {
  dir: string;
  importer: "examples";
};

type SourceComponent = { name: string; source: string };

const stripExtension = (value: string) =>
  value.replace(FILE_EXTENSION_REGEX, "");

const readOptionalFile = async (filePath: string) => {
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
};

const RELATIVE_IMPORT_REGEX =
  /import\s+(?:type\s+)?(?:[\w*\s{},$]+from\s+)?["'](\.[^"']+)["']/g;

const RELATIVE_SOURCE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];
const SOURCE_EXTENSION_REGEX = /\.(tsx|ts|jsx|js)$/;

const stripQueryFromImport = (importPath: string) =>
  importPath.split("?", 1)[0];
const removeExtension = (filePath: string) =>
  filePath.replace(SOURCE_EXTENSION_REGEX, "");

const resolveRelativeImportPath = async (
  baseDir: string,
  importSpecifier: string
) => {
  const sanitizedSpecifier = stripQueryFromImport(importSpecifier);
  const specifierExtension = extname(sanitizedSpecifier);

  if (
    specifierExtension &&
    !RELATIVE_SOURCE_EXTENSIONS.includes(specifierExtension)
  ) {
    return null;
  }

  const hasExtension =
    specifierExtension !== "" &&
    RELATIVE_SOURCE_EXTENSIONS.includes(specifierExtension);

  const candidates: string[] = [];

  if (hasExtension) {
    candidates.push(join(baseDir, sanitizedSpecifier));
  } else {
    for (const extension of RELATIVE_SOURCE_EXTENSIONS) {
      candidates.push(join(baseDir, `${sanitizedSpecifier}${extension}`));
    }

    for (const extension of RELATIVE_SOURCE_EXTENSIONS) {
      candidates.push(
        join(baseDir, join(sanitizedSpecifier, `index${extension}`))
      );
    }
  }

  for (const candidate of candidates) {
    const source = await readOptionalFile(candidate);

    if (source) {
      return { filePath: candidate, source };
    }
  }

  return null;
};

const collectRelativeSources = async ({
  baseDir,
  filePath,
  rootName,
  source,
  addSourceComponent,
  processedFilePaths,
}: {
  baseDir: string;
  filePath: string;
  rootName: string;
  source: string;
  addSourceComponent: (
    name: string,
    source: string,
    options?: { prepend?: boolean }
  ) => void;
  processedFilePaths: Set<string>;
}) => {
  const importMatches = new Set<string>();
  RELATIVE_IMPORT_REGEX.lastIndex = 0;
  let match = RELATIVE_IMPORT_REGEX.exec(source);

  while (match) {
    const specifier = match[1];
    importMatches.add(specifier);
    match = RELATIVE_IMPORT_REGEX.exec(source);
  }

  for (const importSpecifier of importMatches) {
    const resolved = await resolveRelativeImportPath(
      dirname(filePath),
      importSpecifier
    );

    if (!resolved) {
      continue;
    }

    const { filePath: resolvedPath, source: resolvedSource } = resolved;

    if (processedFilePaths.has(resolvedPath)) {
      continue;
    }

    const relativePath = relative(baseDir, resolvedPath);

    if (relativePath.startsWith("..")) {
      continue;
    }

    processedFilePaths.add(resolvedPath);

    const displayName = `${rootName}/${removeExtension(
      relativePath.replace(/\\/g, "/")
    )}`;

    addSourceComponent(displayName, resolvedSource);

    await collectRelativeSources({
      baseDir,
      filePath: resolvedPath,
      rootName,
      source: resolvedSource,
      addSourceComponent,
      processedFilePaths,
    });
  }
};

const gatherSourceComponents = async ({
  code,
  rootName,
  baseDir,
  entryFilePath,
}: {
  code: string;
  rootName: string;
  baseDir: string;
  entryFilePath: string;
}) => {
  const sourceComponents: SourceComponent[] = [];
  const processedFilePaths = new Set<string>();
  const addSourceComponent = (
    name: string,
    source: string,
    options: { prepend?: boolean } = {}
  ) => {
    if (sourceComponents.some((component) => component.name === name)) {
      return;
    }

    if (options.prepend) {
      sourceComponents.unshift({ name, source });
      return;
    }

    sourceComponents.push({ name, source });
  };

  processedFilePaths.add(entryFilePath);
  addSourceComponent(rootName, code, { prepend: true });
  await collectRelativeSources({
    baseDir,
    filePath: entryFilePath,
    rootName,
    source: code,
    addSourceComponent,
    processedFilePaths,
  });

  return sourceComponents;
};

export const Preview = async ({
  path,
  className,
  type = "component",
  wide,
  height,
}: PreviewProps) => {
  const defaultImporter: PreviewSource["importer"] = "examples";
  const rawSources =
    (previewConfig.sources as Array<{
      dir?: string;
      importer?: string;
    }>) ?? [];
  const sources: PreviewSource[] = rawSources
    .filter((source): source is { dir: string; importer?: string } =>
      typeof source?.dir === "string"
    )
    .map((source) => ({
      dir: source.dir,
      importer:
        source.importer === "examples" ? source.importer : defaultImporter,
    }));
  let resolvedSource: {
    code: string;
    filePath: string;
    importer: PreviewSource["importer"];
    baseDir: string;
  } | null = null;

  for (const source of sources) {
    const baseDir = source.dir.startsWith("docs/")
      ? resolve(process.cwd(), "..", source.dir)
      : resolve(process.cwd(), source.dir);
    const filePath = join(baseDir, `${path}.tsx`);
    const code = await readOptionalFile(filePath);

    if (code) {
      resolvedSource = {
        code,
        filePath,
        importer: source.importer,
        baseDir,
      };
      break;
    }
  }

  if (!resolvedSource) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground text-sm">
        Example not found: {path}
      </div>
    );
  }

  const { code, filePath, importer, baseDir } = resolvedSource;
  const importers: Record<
    PreviewSource["importer"],
    Record<string, () => Promise<{ default: React.ComponentType }>>
  > = {
    examples: docsExamplesRegistry,
  };
  const loadModule = importers[importer];
  const Component =
    loadModule?.[path]
      ? await loadModule[path]()
          .then((m) => m.default)
          .catch((error) => {
            console.error(`Failed to load example: ${path}`, error);
            return () => (
              <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground text-sm">
                Failed to load component: {path}
              </div>
            );
          })
      : () => (
          <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground text-sm">
            Preview for {path} is not registered
          </div>
        );

  const parsedCode = code
    .replace(REPO_SHADCN_IMPORT_REGEX, "@/")
    .replace(REPO_ROOT_IMPORT_REGEX, "@/");

  const sourceComponents = await gatherSourceComponents({
    code,
    rootName: stripExtension(path),
    baseDir,
    entryFilePath: filePath,
  });

  return (
    <PreviewShell
      blockPath={type === "block" ? path : undefined}
      className={className}
      parsedCode={parsedCode}
      sourceComponents={sourceComponents}
      type={type}
      wide={wide}
      height={height}
    >
      {type === "component" ? (
        <PreviewRender height={height}>
          <Component />
        </PreviewRender>
      ) : null}
    </PreviewShell>
  );
};
