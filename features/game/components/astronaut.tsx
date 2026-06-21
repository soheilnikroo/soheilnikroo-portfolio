/**
 * Polished vector astronaut (original art) drawn with gradients + glow. Far prettier
 * than hand-coded pixels and a better fit for a dreamy space-dive scene.
 */
export function Astronaut({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 150"
      fill="none"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="suit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c3cce0" />
        </linearGradient>
        <linearGradient id="suitShade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e6ebf6" />
          <stop offset="1" stopColor="#a9b3cb" />
        </linearGradient>
        <radialGradient id="visor" cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#9af2ff" />
          <stop offset="0.45" stopColor="#22d3ee" />
          <stop offset="0.8" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#0b1026" />
        </radialGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
        <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      {/* soft body glow */}
      <ellipse cx="60" cy="78" rx="38" ry="46" fill="#6366f1" opacity="0.25" filter="url(#soft)" />

      {/* backpack */}
      <rect x="40" y="52" width="40" height="52" rx="12" fill="url(#suitShade)" />

      {/* arms */}
      <rect x="20" y="58" width="20" height="44" rx="10" fill="url(#suit)" />
      <rect x="80" y="58" width="20" height="44" rx="10" fill="url(#suit)" />
      {/* gloves */}
      <circle cx="30" cy="102" r="11" fill="url(#suitShade)" />
      <circle cx="90" cy="102" r="11" fill="url(#suitShade)" />

      {/* legs */}
      <rect x="42" y="96" width="16" height="40" rx="8" fill="url(#suit)" />
      <rect x="62" y="96" width="16" height="40" rx="8" fill="url(#suit)" />
      {/* boots */}
      <rect x="40" y="128" width="20" height="14" rx="6" fill="url(#suitShade)" />
      <rect x="60" y="128" width="20" height="14" rx="6" fill="url(#suitShade)" />

      {/* torso */}
      <rect x="36" y="54" width="48" height="54" rx="18" fill="url(#suit)" />
      {/* chest control panel */}
      <rect x="50" y="74" width="20" height="14" rx="4" fill="#0b1026" opacity="0.85" />
      <circle cx="55" cy="81" r="2" fill="#22d3ee" />
      <circle cx="62" cy="81" r="2" fill="#f472b6" />

      {/* helmet */}
      <circle cx="60" cy="40" r="30" fill="url(#suit)" />
      <circle
        cx="60"
        cy="40"
        r="30"
        fill="none"
        stroke="url(#accent)"
        strokeWidth="2.5"
        opacity="0.7"
      />
      {/* visor */}
      <ellipse cx="60" cy="40" rx="22" ry="20" fill="url(#visor)" />
      {/* visor highlight */}
      <ellipse cx="51" cy="32" rx="7" ry="4.5" fill="#ffffff" opacity="0.55" />
      <circle cx="70" cy="48" r="2.4" fill="#ffffff" opacity="0.35" />

      {/* accent shoulder stripe */}
      <rect x="36" y="56" width="48" height="5" rx="2.5" fill="url(#accent)" opacity="0.9" />
    </svg>
  );
}
