#!/usr/bin/env npx tsx
/**
 * Run the full content pipeline. Skip steps with flags.
 * Order: pastebin → assign-paths → articles (missing) → images (missing) → optimize → sync-images → copy-raw → search-index.
 *
 * Usage:
 *   npx tsx scripts/full-update.ts              # run everything
 *   npx tsx scripts/full-update.ts --skip-images --skip-articles
 *
 * Flags (skip that step):
 *   --skip-pastebin   skip fetch-pastebin-missing
 *   --skip-paths      skip assign-program-paths
 *   --skip-articles   skip generate-articles (missing only)
 *   --skip-images     skip generate-article-images (missing only)
 *   --skip-optimize   skip optimize-article-images
 *   --skip-sync-img   skip sync-manifest-images
 *   --skip-raw        skip copy-raw-files
 *   --skip-search     skip build-search-index
 */

import "dotenv/config";
import { execSync } from "child_process";
import path from "path";

const ROOT = path.resolve(__dirname, "..");

function run(name: string, command: string, skip: boolean): void {
  if (skip) {
    console.log(`[skip] ${name}`);
    return;
  }
  console.log(`\n>>> ${name}`);
  execSync(command, { stdio: "inherit", cwd: ROOT });
}

function main(): void {
  const args = process.argv.slice(2);
  const skip = (flag: string) => args.includes(flag);

  console.log("Full update (skip flags:", args.filter((a) => a.startsWith("--")).join(" ") || "none", ")");

  run(
    "fetch-pastebin-missing",
    "npx tsx scripts/fetch-pastebin-missing.ts",
    skip("--skip-pastebin")
  );
  run(
    "assign-program-paths",
    "npx tsx scripts/assign-program-paths.ts",
    skip("--skip-paths")
  );
  run(
    "generate-articles (missing only)",
    "npx tsx scripts/generate-articles.ts --missing-only",
    skip("--skip-articles")
  );
  run(
    "generate-article-images (missing only)",
    "npx tsx scripts/generate-article-images.ts --missing-only",
    skip("--skip-images")
  );
  run(
    "optimize-article-images",
    "npx tsx scripts/optimize-article-images.ts",
    skip("--skip-optimize")
  );
  run(
    "sync-manifest-images",
    "npx tsx scripts/sync-manifest-images.ts",
    skip("--skip-sync-img")
  );
  run(
    "copy-raw-files",
    "bash scripts/copy-raw-files.sh",
    skip("--skip-raw")
  );
  run(
    "build-search-index",
    "npx tsx scripts/build-search-index.ts",
    skip("--skip-search")
  );

  console.log("\nDone.");
}

main();
