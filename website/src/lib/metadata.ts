export interface FileMetadata {
  description?: string;
  version?: string;
  usage?: string;
  lines: string[];
}

/**
 * Extract metadata from Lua file header comments (first ~25 lines)
 */
export function extractLuaMetadata(content: string): FileMetadata {
  const lines = content.split("\n");
  const meta: FileMetadata = { lines: [] };

  let inBlock = false;
  const blockLines: string[] = [];
  const headerLines: string[] = [];

  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (inBlock) {
      if (trimmed.endsWith("]]")) {
        blockLines.push(trimmed.slice(0, -2).trim());
        inBlock = false;
      } else {
        blockLines.push(trimmed);
      }
      continue;
    }

    if (trimmed.startsWith("--[[")) {
      inBlock = true;
      const rest = trimmed.slice(4);
      if (rest.endsWith("]]")) {
        blockLines.push(rest.slice(0, -2).trim());
        inBlock = false;
      } else {
        blockLines.push(rest);
      }
      continue;
    }

    if (trimmed.startsWith("--")) {
      const rest = trimmed.slice(2).trim();
      if (rest.toLowerCase().startsWith("version") || rest.toLowerCase().startsWith("v ")) {
        meta.version = rest.replace(/^(version|v)\s*:?\s*/i, "").trim();
      } else if (rest.toLowerCase().startsWith("usage")) {
        meta.usage = rest.replace(/^usage\s*:?\s*/i, "").trim();
      } else if (rest.includes(" - ") && !meta.description) {
        meta.description = rest.split(" - ").slice(1).join(" - ").trim() || rest;
      } else if (rest && !meta.description && blockLines.length === 0) {
        headerLines.push(rest);
      }
      continue;
    }

    if (trimmed && !inBlock) break;
  }

  if (blockLines.length > 0) {
    meta.description = blockLines.join(" ").trim();
  } else if (headerLines.length > 0 && !meta.description) {
    meta.description = headerLines[0];
  }

  return meta;
}
