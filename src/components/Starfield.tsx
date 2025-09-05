import React, { useMemo } from "react";

/**
 * Pixel-style starfield with twinkles + occasional shooting stars.
 * Renders simple <span> dots so it stays lightweight and SSR-friendly.
 */
export default function Starfield({
  starCount = 120,
  shootingCount = 6,
}: { starCount?: number; shootingCount?: number }) {
  // Generate stable random positions per build
  const stars = useMemo(
    () =>
      Array.from({ length: starCount }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,     // vh
        left: Math.random() * 100,    // vw
        size: Math.random() < 0.85 ? 1 : 2, // pixel size
        delay: Math.random() * 6,     // seconds
        duration: 3 + Math.random() * 5,
      })),
    [starCount]
  );

  const shooters = useMemo(
    () =>
      Array.from({ length: shootingCount }).map((_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 8,   // seconds
        duration: 0.9 + Math.random() * 0.8,
        length: 40 + Math.random() * 60, // px
      })),
    [shootingCount]
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* twinkling pixels */}
      {stars.map((s) => (
        <span
          key={`star-${s.id}`}
          className="star"
          style={{
            top: `${s.top}vh`,
            left: `${s.left}vw`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}

      {/* shooting pixels */}
      {shooters.map((s) => (
        <span
          key={`shoot-${s.id}`}
          className="shoot"
          style={{
            top: `${s.top}vh`,
            left: `${s.left}vw`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            // control streak length via CSS var
            // @ts-ignore CSS var for width
            ["--shoot-len" as any]: `${s.length}px`,
          }}
        />
      ))}
    </div>
  );
}
