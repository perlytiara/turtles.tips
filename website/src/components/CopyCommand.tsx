"use client";

import { useState } from "react";

interface CopyCommandProps {
  command: string;
  label?: string;
  className?: string;
}

export function CopyCommand({ command, label, className = "" }: CopyCommandProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={`group flex items-center gap-2 rounded-lg bg-black/40 font-mono text-sm ${className}`}
    >
      <pre className="flex-1 overflow-x-auto p-3 text-[var(--turtle-lime)] text-xs sm:text-sm">
        {command}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-r-lg border-l border-[var(--border)] px-3 py-3 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--turtle-lime)]"
        title="Copy to clipboard"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
