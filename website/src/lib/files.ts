import path from "path";
import fs from "fs/promises";

const TURTLESPAC_ROOT = path.resolve(process.cwd(), "..", "TurtlesPAC");

export interface DirEntry {
  name: string;
  isDir: boolean;
  size: number;
}

function isPathSafe(resolved: string): boolean {
  return resolved.startsWith(TURTLESPAC_ROOT) && !resolved.includes("..");
}

function resolveArchivePath(...segments: string[]): string {
  const joined = path.join(TURTLESPAC_ROOT, ...segments);
  const resolved = path.resolve(joined);
  if (!isPathSafe(resolved)) {
    throw new Error("Invalid path");
  }
  return resolved;
}

export async function listDirectory(
  ...segments: string[]
): Promise<DirEntry[]> {
  const dirPath = resolveArchivePath(...segments);
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  const result: DirEntry[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dirPath, entry.name);
    const stat = await fs.stat(fullPath).catch(() => null);
    result.push({
      name: entry.name,
      isDir: entry.isDirectory(),
      size: stat?.size ?? 0,
    });
  }

  result.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return result;
}

export async function readFile(...segments: string[]): Promise<string> {
  const filePath = resolveArchivePath(...segments);
  return fs.readFile(filePath, "utf-8");
}

export async function getFileSize(...segments: string[]): Promise<number> {
  const filePath = resolveArchivePath(...segments);
  const stat = await fs.stat(filePath);
  return stat.size;
}

export async function exists(...segments: string[]): Promise<boolean> {
  try {
    const filePath = resolveArchivePath(...segments);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function isDirectory(...segments: string[]): Promise<boolean> {
  try {
    const filePath = resolveArchivePath(...segments);
    const stat = await fs.stat(filePath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function walkAllPaths(
  ...baseSegments: string[]
): Promise<string[][]> {
  const results: string[][] = [];

  async function recurse(segments: string[]) {
    const dirPath = resolveArchivePath(...segments);
    let entries;
    try {
      entries = await fs.readdir(dirPath, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const childSegments = [...segments, entry.name];
      results.push(childSegments);
      if (entry.isDirectory()) {
        await recurse(childSegments);
      }
    }
  }

  await recurse(baseSegments);
  return results;
}
