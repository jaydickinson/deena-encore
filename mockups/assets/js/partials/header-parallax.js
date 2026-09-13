/* Parallax header: scroll and pointer drive three CSS variables; CSS moves each layer at its own depth. */
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  document.querySelectorAll("[data-header-parallax]").forEach((header) => {
    if (header.dataset.parallaxReady) return;
    header.dataset.parallaxReady = "true";
    const stage = header.querySelector(".header-stage");
    let visible = true;
    let raf = null;
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;

    function frame() {
      raf = null;
      if (reduced.matches) return reset();
      const box = stage.getBoundingClientRect();
      const progress = Math.min(Math.max(-box.top / box.height, 0), 1);
      px += (tx - px) * 0.08;
      py += (ty - py) * 0.08;
      header.style.setProperty("--sp", progress.toFixed(4));
      header.style.setProperty("--px", px.toFixed(4));
      header.style.setProperty("--py", py.toFixed(4));
      if (Math.abs(tx - px) > 0.001 || Math.abs(ty - py) > 0.001) request();
    }
    function request() {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    }
    function reset() {
      tx = ty = px = py = 0;
      ["--sp", "--px", "--py"].forEach((name) =>
        header.style.removeProperty(name),
      );
      header.classList.remove("is-lit");
    }

    stage.addEventListener("pointermove", (event) => {
      if (reduced.matches || !finePointer.matches) return;
      const box = stage.getBoundingClientRect();
      tx = (event.clientX - box.left) / box.width - 0.5;
      ty = (event.clientY - box.top) / box.height - 0.5;
      header.style.setProperty("--lx", `${(tx + 0.5) * 100}%`);
      header.style.setProperty("--ly", `${(ty + 0.5) * 100}%`);
      header.classList.add("is-lit");
      request();
    });
    stage.addEventListener("pointerleave", () => {
      tx = ty = 0;
      header.classList.remove("is-lit");
      request();
    });
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) request();
    }).observe(stage);
    addEventListener("scroll", request, { passive: true });
    addEventListener("resize", request);
    reduced.addEventListener("change", () =>
      reduced.matches ? reset() : request(),
    );
    request();
  });
})();
