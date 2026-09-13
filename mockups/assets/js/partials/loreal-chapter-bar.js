/* Trial: sticky chapter bar with scroll-spy and a progress line in the chapter's gel. */
(() => {
  const bar = document.querySelector("[data-chapter-bar]");
  if (!bar) return;
  const links = [...bar.querySelectorAll("a")];
  const sections = links.map((link) =>
    document.querySelector(link.getAttribute("href")),
  );
  if (sections.some((section) => !section)) return;
  const intro = document.querySelector(".loreal-chapters");
  const header = document.querySelector(".site-header-inner");
  const last = sections[sections.length - 1];
  let frame = 0;

  function place() {
    if (header)
      bar.style.setProperty(
        "--chapter-bar-top",
        `${Math.round(header.getBoundingClientRect().bottom)}px`,
      );
  }
  function update() {
    frame = 0;
    const line = innerHeight * 0.4;
    const start = sections[0].getBoundingClientRect().top + scrollY - line;
    const end = last.getBoundingClientRect().bottom + scrollY - innerHeight;
    const progress = Math.min(1, Math.max(0, (scrollY - start) / (end - start)));
    const introGone = intro ? intro.getBoundingClientRect().bottom < 0 : true;
    const pastEnd = last.getBoundingClientRect().bottom < line;
    bar.classList.toggle("is-visible", introGone && !pastEnd);

    let current = -1;
    sections.forEach((section, index) => {
      if (section.getBoundingClientRect().top <= line) current = index;
    });
    links.forEach((link, index) => {
      if (index === current) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    bar.style.setProperty("--bar-progress", progress.toFixed(4));
    if (current >= 0)
      bar.style.setProperty(
        "--bar-colour",
        links[current].style.getPropertyValue("--chapter-colour"),
      );
    // Keep the active chapter in view when the bar scrolls sideways on mobile.
    const active = links[current];
    if (active && bar.classList.contains("is-visible")) {
      const inner = active.parentElement;
      const offset = active.offsetLeft - inner.offsetLeft;
      if (offset < inner.scrollLeft || offset > inner.scrollLeft + inner.clientWidth - active.offsetWidth)
        inner.scrollLeft = offset - 16;
    }
  }
  function request() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", () => {
    place();
    request();
  });
  place();
  update();
})();
