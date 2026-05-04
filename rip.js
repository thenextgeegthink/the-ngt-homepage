/**
 * rip.js — NGT Paper Rip Scroll Effect
 * Branch: ts-test
 *
 * Technique:
 *   1. Track scroll position (0 = top, 1 = end of scene).
 *   2. Map scroll to ripProgress (0..1), eased.
 *   3. Generate a randomised torn-edge SVG path using
 *      a seeded pseudo-random noise function.
 *   4. Update the SVG clipPath on the paper sheet.
 *   5. Expose --rip-progress CSS variable for CSS-driven
 *      child animations (breakout element, below content).
 *
 * NO external libraries. Vanilla JS only.
 */

(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────
  const SCENE_HEIGHT_VH = 400; // must match CSS --scene-height (400vh)
  const RIP_START_SCROLL = 0.05;  // scroll fraction when rip begins
  const RIP_END_SCROLL   = 0.55;  // scroll fraction when rip is complete
  const EDGE_SEGMENTS    = 80;    // more = more detailed jagged edge
  const JAGGEDNESS      = 0.032; // amplitude of random displacement (0..1 in clipPath space)
  const NOISE_SEED       = 7;    // change to get different random shapes

  // ── DOM refs ────────────────────────────────────────────────────────
  const ripPath    = document.getElementById('ripPath');
  const paperSheet = document.getElementById('paperSheet');
  const debugScroll = document.getElementById('debugScroll');
  const debugRip    = document.getElementById('debugRip');

  // ── State ────────────────────────────────────────────────────────────
  let lastRipProgress = -1;

  // ── Seeded pseudo-random (LCG) ───────────────────────────────────────
  // Returns a deterministic value in [-1, 1] for a given seed + index.
  // This means the rip shape is ALWAYS the same, not random every frame.
  function seededRand(seed, index) {
    const x = Math.sin(seed * 9301 + index * 49297 + 233) * 93451;
    return (x - Math.floor(x)) * 2 - 1; // -1 to 1
  }

  // ── Build the torn-edge SVG path ────────────────────────────────────
  /**
   * Generates an SVG path string for the clipPath.
   * clipPathUnits="objectBoundingBox" so all coords are 0..1.
   *
   * @param {number} progress  0 = no rip (full paper), 1 = fully torn
   * @returns {string} SVG path d attribute
   */
  function buildRipPath(progress) {
    if (progress <= 0) {
      // Full paper — simple rectangle
      return 'M0,0 L1,0 L1,1 L0,1 Z';
    }

    if (progress >= 1) {
      // Fully torn — paper is gone (empty clip = nothing shown)
      // We keep a tiny sliver at top so it doesn't flash
      return 'M0,0 L1,0 L1,0 L0,0 Z';
    }

    // The torn bottom edge sits at this Y position (0=top, 1=bottom)
    // progress 0 → edge at y=1 (bottom, invisible)
    // progress 1 → edge at y=0 (top, fully torn off)
    const baseY = 1 - progress;

    // Build the top part of the paper (rectangle top)
    let d = `M0,0 L1,0 L1,${baseY.toFixed(4)} `;

    // Build the jagged bottom edge, right → left
    for (let i = EDGE_SEGMENTS; i >= 0; i--) {
      const t = i / EDGE_SEGMENTS; // 0..1 along X axis
      const x = t;

      // Multi-frequency noise for organic feel
      const noise1 = seededRand(NOISE_SEED, i);
      const noise2 = seededRand(NOISE_SEED + 10, i * 2 + 1) * 0.5;
      const noise3 = seededRand(NOISE_SEED + 20, i * 3 + 2) * 0.25;
      const combinedNoise = (noise1 + noise2 + noise3) / 1.75;

      // Noise amplitude scales by jaggedness
      // Near edges (x close to 0 or 1) we reduce noise for cleaner corners
      const edgeFade = Math.sin(Math.PI * x); // 0 at edges, 1 at center
      const ny = baseY + combinedNoise * JAGGEDNESS * edgeFade;

      // Clamp so the paper never goes past top or bottom
      const clampedY = Math.max(0, Math.min(1, ny));

      d += `L${x.toFixed(4)},${clampedY.toFixed(4)} `;
    }

    d += ' Z';
    return d;
  }

  // ── Easing function ──────────────────────────────────────────────────
  function easeInOut(t) {
    return t < 0.5
      ? 2 * t * t
      : -1 + (4 - 2 * t) * t;
  }

  // ── Main scroll handler ─────────────────────────────────────────────
  function onScroll() {
    const scrollY   = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollFraction = maxScroll > 0 ? scrollY / maxScroll : 0;

    // Map scroll fraction to rip progress
    const rawProgress = (scrollFraction - RIP_START_SCROLL) /
                        (RIP_END_SCROLL - RIP_START_SCROLL);
    const ripProgress = Math.max(0, Math.min(1, easeInOut(rawProgress)));

    // Only update DOM if value meaningfully changed (perf)
    if (Math.abs(ripProgress - lastRipProgress) < 0.001) return;
    lastRipProgress = ripProgress;

    // Update SVG clip path
    const pathData = buildRipPath(ripProgress);
    ripPath.setAttribute('d', pathData);

    // Update CSS variable for child animations
    document.documentElement.style.setProperty(
      '--rip-progress',
      ripProgress.toFixed(4)
    );

    // Debug
    debugScroll.textContent = `scroll: ${(scrollFraction * 100).toFixed(1)}%`;
    debugRip.textContent    = `rip: ${(ripProgress * 100).toFixed(1)}%`;
  }

  // ── Init ─────────────────────────────────────────────────────────────
  function init() {
    // Passive scroll listener for best performance
    window.addEventListener('scroll', onScroll, { passive: true });

    // Run once on load
    onScroll();

    console.log('[NGT rip.js] Paper rip prototype initialised.');
    console.log('Scroll down to see the effect.');
    console.log('Adjust JAGGEDNESS, EDGE_SEGMENTS, NOISE_SEED in rip.js to tune.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
