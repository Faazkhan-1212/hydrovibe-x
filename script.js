// Keep scroll and pointer motion lightweight: only a few transforms are updated per frame.
(() => {
  const hero = document.querySelector(".hero");
  const drone = document.querySelector(".drone-frame");
  const water = document.querySelector(".scene-water");
  const pageRoot = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!hero || !drone || reducedMotion.matches) return;

  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;

  const updateMotion = () => {
    const bounds = hero.getBoundingClientRect();
    const progress = Math.max(-1, Math.min(1, -bounds.top / Math.max(bounds.height, 1)));
    const pageScroll = window.scrollY || 0;
    const scrollShift = Math.max(-10, Math.min(10, progress * 12));
    drone.style.setProperty("--scroll-shift", `${scrollShift}px`);
    drone.style.setProperty("--pointer-x", `${pointerX}px`);
    drone.style.setProperty("--pointer-y", `${pointerY}px`);
    if (water) water.style.setProperty("--water-shift", `${progress * 7}px`);
    // The fixed water layers move at different speeds to create depth as the page scrolls.
    pageRoot.style.setProperty("--caustic-shift", `${pageScroll * -0.055}px`);
    pageRoot.style.setProperty("--current-back-shift", `${pageScroll * -0.12}px`);
    pageRoot.style.setProperty("--current-front-shift", `${pageScroll * 0.075}px`);
    pageRoot.style.setProperty("--speck-shift", `${pageScroll * -0.19}px`);
    pageRoot.style.setProperty("--section-water-shift", `${pageScroll * 0.045}px`);
    frame = 0;
  };

  const scheduleMotion = () => {
    if (!frame) frame = requestAnimationFrame(updateMotion);
  };

  window.addEventListener("scroll", scheduleMotion, { passive: true });
  window.addEventListener("resize", scheduleMotion, { passive: true });

  // Mouse depth cues are disabled on touch devices to avoid unnecessary work.
  if (window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 5;
      scheduleMotion();
    }, { passive: true });
    hero.addEventListener("pointerleave", () => {
      pointerX = 0;
      pointerY = 0;
      scheduleMotion();
    }, { passive: true });
  }

  scheduleMotion();
})();
