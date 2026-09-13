/* Progressive enhancement: content is never hidden by CSS or an init class. */
(() => {
  const root = document.querySelector("[data-microinteractions]");
  if (!root || root.dataset.motionReady || !("IntersectionObserver" in window))
    return;
  root.dataset.motionReady = "true";
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const targets = [...root.querySelectorAll("[data-reveal]")];
  const played = new WeakSet();
  const active = new Map();
  const tokens = getComputedStyle(document.documentElement);
  const duration =
    parseFloat(tokens.getPropertyValue("--motion-reveal")) || 480;
  const distance =
    tokens.getPropertyValue("--motion-distance").trim() || "14px";
  const easing = tokens.getPropertyValue("--motion-ease").trim() || "ease-out";
  function cancel(element) {
    active.get(element)?.cancel();
    active.delete(element);
  }
  function reveal(element, replay = false) {
    if (played.has(element) && !replay) return;
    played.add(element);
    cancel(element);
    if (
      preference.matches ||
      document.hidden ||
      element.contains(document.activeElement) ||
      !element.animate
    )
      return;
    const step = Number(element.dataset.revealStep) || 0;
    const animation = element.animate(
      [
        { opacity: 0, transform: `translateY(${distance})` },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration,
        delay: Math.min(Math.max(step, 0) * 60, 180),
        easing,
        fill: "backwards",
      },
    );
    active.set(element, animation);
    animation.finished
      .then(() => {
        if (active.get(element) === animation) active.delete(element);
      })
      .catch(() => {}); // Cancellation is expected on focus or motion preference changes.
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        reveal(entry.target);
      }
    },
    { threshold: 0.08 },
  );
  targets.forEach((element) => observer.observe(element));
  root.addEventListener("focusin", (event) => {
    // A keyboard destination must be immediately visible, even during a stagger.
    for (const element of targets) {
      if (element.contains(event.target)) {
        played.add(element);
        cancel(element);
      }
    }
  });
  const cancelAll = () => {
    for (const element of active.keys()) cancel(element);
  };
  preference.addEventListener("change", () => {
    if (preference.matches) cancelAll();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAll();
  });
  root.querySelectorAll("[data-motion-replay]").forEach((button) =>
    button.addEventListener("click", () => {
      const demo = document.getElementById(
        button.getAttribute("aria-controls"),
      );
      demo
        ?.querySelectorAll("[data-reveal]")
        .forEach((element) => reveal(element, true));
    }),
  );
})();
