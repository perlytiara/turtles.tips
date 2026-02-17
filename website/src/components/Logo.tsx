/** Inline SVG logo — zero extra requests, loads instantly */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
    >
      <ellipse cx="16" cy="17" rx="11" ry="9" fill="currentColor" />
      <ellipse cx="16" cy="4" rx="5" ry="4" fill="currentColor" opacity=".9" />
      <circle cx="16" cy="3.2" r="1" fill="var(--bg)" />
    </svg>
  );
}
