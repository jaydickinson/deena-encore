(() => {
  const dialog = document.querySelector(".loreal-viewer");
  const buttons = [...document.querySelectorAll(".loreal-gallery-open")];
  if (!dialog || !buttons.length) return;
  const image = dialog.querySelector("img");
  const caption = dialog.querySelector(".loreal-viewer-caption");
  const count = dialog.querySelector(".loreal-viewer-count");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let index = 0;
  let animation;
  let touchStart = null;
  let previousOverflow;
  function show(next, direction = 1) {
    index = (next + buttons.length) % buttons.length;
    const source = buttons[index].querySelector("img");
    image.src = source.src;
    image.alt = source.alt;
    caption.textContent = source.alt;
    count.textContent = `${index + 1} / ${buttons.length}`;
    animation?.cancel();
    if (!reduced.matches)
      animation = image.animate(
        [
          { opacity: 0.35, transform: `translateX(${direction * 14}px)` },
          { opacity: 1, transform: "translateX(0)" },
        ],
        { duration: 260, easing: "cubic-bezier(.22,1,.36,1)" },
      );
  }
  buttons.forEach((button, i) =>
    button.addEventListener("click", () => {
      previousOverflow = document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow = "hidden";
      show(i);
    }),
  );
  dialog
    .querySelector("[data-gallery-close]")
    .addEventListener("click", () => dialog.close());
  dialog
    .querySelector("[data-gallery-prev]")
    .addEventListener("click", () => show(index - 1, -1));
  dialog
    .querySelector("[data-gallery-next]")
    .addEventListener("click", () => show(index + 1));
  dialog.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const direction = e.key === "ArrowLeft" ? -1 : 1;
      show(index + direction, direction);
    }
  });
  image.addEventListener(
    "touchstart",
    (e) => {
      const t = e.changedTouches[0];
      touchStart = { x: t.clientX, y: t.clientY };
    },
    { passive: true },
  );
  image.addEventListener(
    "touchend",
    (e) => {
      if (!touchStart) return;
      const t = e.changedTouches[0],
        dx = t.clientX - touchStart.x,
        dy = t.clientY - touchStart.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy))
        show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      touchStart = null;
    },
    { passive: true },
  );
  dialog.addEventListener("close", () => {
    document.body.style.overflow = previousOverflow;
    animation?.cancel();
  });
  reduced.addEventListener("change", () => {
    if (reduced.matches) animation?.cancel();
  });
})();
