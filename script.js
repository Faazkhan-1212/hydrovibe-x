// Scroll motion, component identification, and the live build-log widget.
(() => {
  const board = document.querySelector("#circuit-board");
  const parts = [...document.querySelectorAll(".board-part")];
  const countOutput = document.querySelector("#identified-count");
  const progressFill = document.querySelector("#build-progress-fill");
  const statusOutput = document.querySelector("#build-status");
  const resetButton = document.querySelector("#reset-build");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const identified = new Set();
  let activeSection = "home";
  let hoveredPart = null;
  let frame = 0;
  let pointerTiltX = 0;
  let pointerTiltY = 0;
  let pointerTiltZ = 0;
  let statusAnimationFrame = 0;

  const details = {
    matrix: ["5 × 5 sensor matrix", "A proposed sensor interface grid gathers signals from multiple water-monitoring points."],
    supercap: ["Supercapacitor bank", "Buffers short bursts of electrical energy for transient loads; capacity and power use require measurement."],
    esp32: ["ESP32 controller", "Coordinates sensor readings and control logic in the prototype electronics concept."],
    resistors: ["Resistor bank", "Sets signal levels and current limits for the board’s low-voltage sensing circuits."],
    ph: ["pH sensor input", "Connects the pH probe interface for acidity or alkalinity measurements."],
    turbidity: ["Turbidity sensor input", "Accepts readings from a sensor that estimates suspended particles in the water."],
    temperature: ["Temperature sensor input", "Feeds water-temperature readings into the monitoring system."],
    conductivity: ["Conductivity input", "Connects an electrical-conductivity probe to help characterize the sampled water."],
    battery: ["Battery interface", "Connects the onboard battery and provides a monitored supply path for the system."],
    solar: ["Solar input", "A proposed input for solar-assisted charging; real output depends on panel, sunlight, and charging control."],
    pump: ["Pump driver", "Switches the water-pump load that moves water through the modular treatment path."],
    motor: ["Propulsion motor driver", "Provides a controlled interface for the drone’s propulsion system."],
    filter: ["Filter switching stage", "Controls a switched treatment component such as a valve or filtration stage, subject to the final hardware design."],
    protection: ["Power protection", "Represents the fuse and transient-protection stage intended to protect power rails and attached modules."]
  };

  const sectionMessages = {
    home: "Scroll the story to see the board rotate. Hover a part, then click to identify it.",
    about: "Mission: a floating platform for treatment and before/after water monitoring.",
    problem: "Challenge: water conditions vary across lakes and ponds; monitoring takes repeated effort.",
    solution: "System path: intake, pre-filter, algae chamber, post-filter, then water checks.",
    algae: "Biology: algae uptake is conditional; collected biomass needs safe handling.",
    tracks: "Design domains: biology, robotics, sensing, and energy meet on this board."
  };

  const setStatus = (message) => {
    if (!statusOutput || statusOutput.textContent === message) return;
    statusOutput.textContent = message;
    if (!reducedMotion.matches) {
      statusOutput.classList.remove("is-updating");
      void statusOutput.offsetWidth;
      statusOutput.classList.add("is-updating");
      cancelAnimationFrame(statusAnimationFrame);
      statusAnimationFrame = requestAnimationFrame(() => statusOutput.classList.remove("is-updating"));
    }
  };
  const restoreStatus = () => {
    if (hoveredPart && details[hoveredPart]) {
      const [name] = details[hoveredPart];
      setStatus(`${name} — click to identify this component.`);
    } else {
      setStatus(sectionMessages[activeSection] || sectionMessages.home);
    }
  };
  const updateCount = () => {
    if (!countOutput || !progressFill) return;
    countOutput.textContent = String(identified.size);
    progressFill.style.width = `${(identified.size / parts.length) * 100}%`;
    document.querySelector(".build-log")?.classList.toggle("is-complete", identified.size === parts.length && parts.length > 0);
    if (!reducedMotion.matches) {
      countOutput.classList.remove("is-bumping");
      void countOutput.offsetWidth;
      countOutput.classList.add("is-bumping");
    }
  };

  parts.forEach((part) => {
    const id = part.dataset.part;
    const [name, purpose] = details[id] || [part.textContent.trim(), "Board component."];
    part.title = `${name}: ${purpose}`;
    part.addEventListener("pointerenter", () => {
      hoveredPart = id;
      setStatus(`${name}: ${purpose}`);
    });
    part.addEventListener("pointerleave", () => {
      if (hoveredPart === id) hoveredPart = null;
      restoreStatus();
    });
    part.addEventListener("focus", () => {
      hoveredPart = id;
      setStatus(`${name}: ${purpose}`);
    });
    part.addEventListener("blur", () => {
      if (hoveredPart === id) hoveredPart = null;
      restoreStatus();
    });
    part.addEventListener("click", () => {
      if (!identified.has(id)) identified.add(id);
      part.classList.add("is-identified");
      part.setAttribute("aria-pressed", "true");
      updateCount();
      setStatus(`Identified ${name}. ${identified.size} of ${parts.length} parts logged.`);
    });
    part.setAttribute("aria-pressed", "false");
  });

  resetButton?.addEventListener("click", () => {
    identified.clear();
    parts.forEach((part) => {
      part.classList.remove("is-identified");
      part.setAttribute("aria-pressed", "false");
    });
    updateCount();
    hoveredPart = null;
    setStatus("Build log reset. Hover a board component and click to identify it.");
  });

  const sections = [...document.querySelectorAll(".story-section[id]")];
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      activeSection = visible.target.id;
      if (!hoveredPart) restoreStatus();
    }, { rootMargin: "-28% 0px -48% 0px", threshold: [0, .15, .35, .6] });
    sections.forEach((section) => observer.observe(section));
  }

  const scheduleBoardMotion = () => {
    if (!board || frame) return;
    frame = requestAnimationFrame(() => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      if (!reducedMotion.matches) {
        const rotationPhase = progress * Math.PI * 2;
        board.style.setProperty("--scroll-rotate-x", `${Math.sin(rotationPhase) * 11}deg`);
        board.style.setProperty("--scroll-rotate-y", `${Math.sin(rotationPhase + Math.PI / 2) * 15}deg`);
        board.style.setProperty("--scroll-rotate-z", `${(progress - .5) * 24}deg`);
        board.style.setProperty("--scroll-lift", `${Math.sin(progress * Math.PI * 2) * 9}px`);
        board.style.setProperty("--pointer-tilt-x", `${pointerTiltX}deg`);
        board.style.setProperty("--pointer-tilt-y", `${pointerTiltY}deg`);
        board.style.setProperty("--pointer-tilt-z", `${pointerTiltZ}deg`);
      }
      frame = 0;
    });
  };
  window.addEventListener("scroll", scheduleBoardMotion, { passive: true });
  window.addEventListener("resize", scheduleBoardMotion, { passive: true });
  if (board && window.matchMedia("(pointer: fine)").matches && !reducedMotion.matches) {
    board.addEventListener("pointermove", (event) => {
      const bounds = board.getBoundingClientRect();
      pointerTiltX = ((event.clientY - bounds.top) / bounds.height - .5) * 7;
      pointerTiltY = ((event.clientX - bounds.left) / bounds.width - .5) * 8;
      pointerTiltZ = ((event.clientX - bounds.left) / bounds.width - .5) * 5;
      scheduleBoardMotion();
    }, { passive: true });
    board.addEventListener("pointerleave", () => {
      pointerTiltX = 0;
      pointerTiltY = 0;
      pointerTiltZ = 0;
      scheduleBoardMotion();
    }, { passive: true });
  }
  scheduleBoardMotion();
})();

  const sketchSection = document.querySelector("#sketch");
  const buildLog = document.querySelector(".build-log");
  if (sketchSection && buildLog && "IntersectionObserver" in window) {
    const sketchObserver = new IntersectionObserver(([entry]) => {
      buildLog.classList.toggle("is-sketch-view", entry.isIntersecting);
    }, { threshold: 0.08 });
    sketchObserver.observe(sketchSection);
  }
