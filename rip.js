/**
 * rip.js — NGT Vertical V-Tear Effect
 *
 * Logic:
 *   - Splits the paper into two halves (Left and Right).
 *   - The tear starts at the top and widens into a 'V' shape as you scroll.
 *   - Jagged edges are generated along the vertical split.
 */

(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────
  const EDGE_SEGMENTS = 60;   // Precision of the jagged edge
  const JAGGEDNESS   = 0.04; // Max width of the "zig-zags"
  const NOISE_SEED    = 13;   // Base seed for deterministic randomness

  // ── DOM refs ────────────────────────────────────────────────────────
  const pathLeft    = document.getElementById('pathLeft');
  const pathRight   = document.getElementById('pathRight');
  const debugScroll = document.getElementById('debugScroll');

  // ── State ───────────────────────────────────────────────────────────
  let lastProgress = -1;

  // ── Seeded pseudo-random ────────────────────────────────────────────
  function seededRand(seed, index) {
    const x = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453;
    return (x - Math.floor(x)) * 2 - 1; // -1 to 1
  }

  // ── Build Paths ─────────────────────────────────────────────────────
  /**
   * Updates the SVG paths for both halves based on scroll progress.
   * Progress: 0 = sealed, 1 = wide open.
   */
  function updateTear(progress) {
    if (Math.abs(progress - lastProgress) < 0.0005) return;
    lastProgress = progress;

    // tearY: How far down the tear has reached (0..1)
    // We multiply by 1.2 so it eventually clears the bottom (y=1)
    const tearY = Math.min(1.2, progress * 1.5);

    // widthAtTop: How wide the opening is at the top edge (y=0)
    const maxWidth = 0.6; // max opening is 60% of screen width
    const widthAtTop = progress * maxWidth;

    // Generate Points
    let leftPoints = [];
    let rightPoints = [];

    // Top to Bottom
    for (let i = 0; i <= EDGE_SEGMENTS; i++) {
      const y = i / EDGE_SEGMENTS; // 0..1

      // Gap at this specific Y height
      // If y > tearY, paper is still joined at center (0.5)
      // Otherwise, gap scales linearly from widthAtTop (at y=0) to 0 (at y=tearY)
      let currentGap = 0;
      if (y < tearY) {
        currentGap = widthAtTop * (1 - y / tearY);
      }

      // Add jaggedness noise
      // Noise only applies where there IS a tear
      const noiseAmp = y <= tearY ? JAGGEDNESS : 0;
      const nLeft  = seededRand(NOISE_SEED, i) * noiseAmp;
      const nRight = seededRand(NOISE_SEED + 50, i) * noiseAmp;

      // x coords (centered at 0.5)
      const xLeft  = 0.5 - currentGap / 2 + nLeft;
      const xRight = 0.5 + currentGap / 2 + nRight;

      leftPoints.push({ x: xLeft, y: y });
      rightPoints.push({ x: xRight, y: y });
    }

    // Construct SVG Path Strings
    // Left Half: M(0,0) -> L(xLeftTop, 0) -> [jagged edge] -> L(xLeftBottom, 1) -> L(0,1) Z
    let dLeft = `M0,0 L${leftPoints[0].x.toFixed(4)},0 `;
    for (let p of leftPoints) {
      dLeft += `L${p.x.toFixed(4)},${p.y.toFixed(4)} `;
    }
    dLeft += `L0,1 Z`;

    // Right Half: M(1,0) -> L(xRightTop, 0) -> [jagged edge] -> L(xRightBottom, 1) -> L(1,1) Z
    let dRight = `M1,0 L${rightPoints[0].x.toFixed(4)},0 `;
    for (let p of rightPoints) {
      dRight += `L${p.x.toFixed(4)},${p.y.toFixed(4)} `;
    }
    dRight += `L1,1 Z`;

    pathLeft.setAttribute('d', dLeft);
    pathRight.setAttribute('d', dRight);

    // Update Global CSS variable
    document.documentElement.style.setProperty('--rip-progress', progress.toFixed(4));

    // Debug
    debugScroll.textContent = `tear: ${(progress * 100).toFixed(1)}%`;
  }

  // ── Scroll Listener ──────────────────────────────────────────────────
  function onScroll() {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? scrollY / maxScroll : 0;

    // Easing for smoother "tear feel"
    // We want it to be stiff at first then open up
    const eased = Math.pow(progress, 1.2);

    updateTear(eased);
  }

  // ── Init ─────────────────────────────────────────────────────────────
  function init() {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    console.log('[NGT] Vertical V-Tear prototype initialised.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
