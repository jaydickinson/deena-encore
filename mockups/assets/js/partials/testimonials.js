/**
 * Progressively enhance each testimonial section into two CSS-driven loops.
 * Original quotes stay in the HTML; visual duplicates are inert and hidden from AT.
 * User pause is independent of offscreen/tab suspension and motion preferences.
 */
(() => {
  "use strict";

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.querySelectorAll("[data-testimonials]").forEach((section) => {
    if (section.dataset.testimonialsReady) return;

    const rows = [...section.querySelectorAll(".quote-row")];
    const button = section.querySelector(".quotes-toggle");
    if (!rows.length || !button) return;

    rows.forEach((row) => {
      const track = document.createElement("div");
      track.className = "quote-track";
      const group = document.createElement("div");
      group.className = "quote-group";
      group.append(...row.children);

      const duplicate = group.cloneNode(true);
      duplicate.setAttribute("aria-hidden", "true");
      duplicate.inert = true;
      // Keep repeated content from introducing duplicate document IDs.
      duplicate
        .querySelectorAll("[id]")
        .forEach((element) => element.removeAttribute("id"));
      track.append(group, duplicate);
      row.append(track);
    });

    let pausedByUser = false;
    let inView = true;

    function render() {
      const reduced = motion.matches;
      section.classList.toggle("is-paused", pausedByUser);
      section.classList.toggle("is-suspended", !inView || document.hidden);
      button.hidden = reduced;
      // This is an action button with a changing label, not an aria-pressed toggle.
      button.textContent = pausedByUser ? "Resume movement" : "Pause movement";
      rows.forEach((row, index) => {
        row.setAttribute(
          "aria-label",
          `Client testimonials, row ${index + 1}. ${
            reduced
              ? "Scroll to read more."
              : `Movement ${pausedByUser ? "paused" : "playing"}. Click or press Enter or Space to ${pausedByUser ? "resume" : "pause"}.`
          }`,
        );
      });
    }

    function toggle() {
      if (motion.matches) return;
      pausedByUser = !pausedByUser;
      render();
    }

    button.addEventListener("click", toggle);
    rows.forEach((row) => {
      row.addEventListener("click", (event) => {
        if (event.target.closest("a, button, input, select, textarea")) return;
        // Selecting an excerpt should not accidentally change the playback state.
        if (window.getSelection()?.toString()) return;
        toggle();
      });
      row.addEventListener("keydown", (event) => {
        if (event.target !== row || event.repeat || motion.matches) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      });
    });

    motion.addEventListener("change", render);
    document.addEventListener("visibilitychange", render);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        render();
      });
      observer.observe(section);
    }

    section.dataset.testimonialsReady = "true";
    render();
  });
})();
