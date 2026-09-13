/* Decorative background loops. Content and poster remain usable without JS. */
(() => {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll("[data-header-video]").forEach((header) => {
    if (header.dataset.videoReady) return;
    header.dataset.videoReady = "true";
    const video = header.querySelector("video");
    const button = header.querySelector(".header-video-toggle");
    if (!video || !button) return;
    let visible = false;
    let userWantsPlay = !preference.matches && !navigator.connection?.saveData;
    let failed = false;
    button.hidden = false;
    video.muted = true;

    const label = () => {
      button.textContent = failed
        ? "Video unavailable"
        : video.paused
          ? "Play background video"
          : "Pause background video";
    };
    const update = () => {
      if (!userWantsPlay || !visible || document.hidden || failed) {
        video.pause();
        label();
        return;
      }
      if (!video.hasAttribute("src")) video.src = video.dataset.videoSrc;
      video.play().catch(() => {
        // Autoplay may be denied. Leave the poster and offer explicit playback.
        if (userWantsPlay && visible && !document.hidden) label();
      });
    };
    video.addEventListener("playing", () => {
      video.classList.add("is-ready");
      label();
    });
    video.addEventListener("pause", label);
    video.addEventListener("error", () => {
      failed = true;
      video.classList.remove("is-ready");
      button.disabled = true;
      label();
    });
    button.addEventListener("click", () => {
      userWantsPlay = video.paused;
      update();
    });
    preference.addEventListener("change", () => {
      userWantsPlay = !preference.matches && !navigator.connection?.saveData;
      update();
    });
    document.addEventListener("visibilitychange", update);
    new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        update();
      },
      { threshold: 0.05 },
    ).observe(video);
    label();
  });
})();
