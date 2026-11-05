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

// Keep the sketch labels and function card synchronized for mouse, touch, and keyboard.
(() => {
  const partDetails = {
    canopy: {
      number: "01 / 06",
      title: "Canopy + solar panel",
      description: "The canopy shelters the central treatment assembly. Its proposed solar panel can supplement onboard power; actual output depends on panel size, sunlight, and system load."
    },
    algae: {
      number: "02 / 06",
      title: "Replaceable algae filter pod",
      description: "The removable cartridge is the proposed phycoremediation chamber. Selected algae may take up nutrients; the cartridge needs maintenance and safe handling after use."
    },
    intake: {
      number: "03 / 06",
      title: "Water intake",
      description: "The intake draws surrounding water into the treatment path, where a pre-filter can catch larger debris before water reaches the algae chamber."
    },
    pontoon: {
      number: "04 / 06",
      title: "Floating pontoons",
      description: "The paired pontoons support the craft on the water and are designed to help keep the central purification assembly stable. Buoyancy and stability need testing on the finished build."
    },
    dock: {
      number: "05 / 06",
      title: "Bank-side charging dock",
      description: "The shore dock is a proposed home point for recharging, inspection, maintenance, and data transfer. Automatic return and docking require navigation and alignment control."
    },
    outlet: {
      number: "06 / 06",
      title: "Treated-water outlet",
      description: "Water leaves after the proposed treatment and post-filter stages. Outlet readings should be compared with intake readings; this concept does not certify water as safe to drink."
    }
  };
  const controls = document.querySelectorAll("[data-part]");
  const title = document.getElementById("sketch-part-title");
  const description = document.getElementById("sketch-part-description");
  const number = document.getElementById("sketch-number");
  if (!controls.length || !title || !description || !number) return;

  const selectPart = (key) => {
    const detail = partDetails[key];
    if (!detail) return;
    title.textContent = detail.title;
    description.textContent = detail.description;
    number.textContent = detail.number;
    controls.forEach((control) => {
      const selected = control.dataset.part === key;
      control.classList.toggle("is-active", selected);
      control.setAttribute("aria-pressed", String(selected));
    });
  };

  controls.forEach((control) => {
    control.addEventListener("click", () => selectPart(control.dataset.part));
  });
})();
