"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts up to `value` on mount (and whenever it grows) with an ease-out curve,
 * so the big numbers roll in smoothly instead of snapping into place.
 */
export default function RollingCount({
  value,
  className,
  durationMs = 1100,
}: {
  value: number;
  className?: string;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const current = Math.round(from + (to - from) * eased);
      setDisplay(current);
      fromRef.current = current;
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  return <span className={className}>{display.toLocaleString()}</span>;
}
