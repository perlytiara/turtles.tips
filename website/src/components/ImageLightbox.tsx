"use client";

import { useState, useEffect, useCallback } from "react";

const ExpandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

interface ImageLightboxProps {
  src: string;
  alt?: string;
  caption?: string;
  className?: string;
  /** Optional wrapper class for the clickable thumbnail (e.g. aspect-video) */
  wrapperClassName?: string;
}

export function ImageLightbox({ src, alt = "", caption, className = "", wrapperClassName = "" }: ImageLightboxProps) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  return (
    <>
      <figure className={wrapperClassName || undefined}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative block w-full h-full min-h-0 group cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[var(--turtle-lime)] focus:ring-offset-2 focus:ring-offset-[var(--surface)] rounded-[var(--radius)] overflow-hidden"
        >
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity group-hover:opacity-90 ${className}`}
          />
          <span
            className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            aria-hidden
          >
            <span className="rounded-full bg-black/60 p-2 text-white">
              <ExpandIcon />
            </span>
          </span>
        </button>
        {caption && (
          <figcaption className="text-xs text-[var(--muted)] mt-1">
            {caption}
          </figcaption>
        )}
      </figure>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="View image full size"
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 z-10 rounded-full p-2 text-white/90 hover:text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
          <div
            className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
