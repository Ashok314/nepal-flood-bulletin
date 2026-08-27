/**
 * Flag of Nepal — the double-pennant national flag (crimson field, blue
 * border, white crescent moon above and white sun below). Rendered as inline
 * SVG so it scales crisply at any size.
 */
export default function NepalFlag({
  className = "h-6 w-auto",
}: {
  className?: string;
}) {
  const sun = { cx: 92, cy: 208, r: 13 };
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 12 - Math.PI / 2;
    return {
      x1: sun.cx + Math.cos(a) * (sun.r + 2),
      y1: sun.cy + Math.sin(a) * (sun.r + 2),
      x2: sun.cx + Math.cos(a) * (sun.r + 11),
      y2: sun.cy + Math.sin(a) * (sun.r + 11),
    };
  });

  return (
    <svg
      viewBox="0 0 256 306"
      className={className}
      role="img"
      aria-label="Flag of Nepal"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <mask id="np-moon">
          <rect x="0" y="0" width="256" height="306" fill="black" />
          <circle cx="82" cy="80" r="26" fill="white" />
          <circle cx="96" cy="66" r="24" fill="black" />
        </mask>
      </defs>

      {/* Crimson field with blue border */}
      <polygon
        points="20,15 216,108 92,132 236,205 20,285"
        fill="#DC143C"
        stroke="#003893"
        strokeWidth="11"
        strokeLinejoin="round"
      />

      {/* Moon (upper pennant) */}
      <rect x="0" y="0" width="256" height="306" fill="white" mask="url(#np-moon)" />

      {/* Sun (lower pennant) */}
      <g stroke="white" strokeWidth="4.5" strokeLinecap="round">
        {rays.map((r, i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
        ))}
      </g>
      <circle cx={sun.cx} cy={sun.cy} r={sun.r} fill="white" />
    </svg>
  );
}
