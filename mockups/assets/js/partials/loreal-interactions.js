/* L'Oréal case study: pointer parallax hero, services checklists, next-project film. */
(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");

  // Hero: the photograph, headline and a soft spotlight move at different depths
  // with the pointer, so the room feels like it can be looked around.
  const hero = document.querySelector(".loreal-hero");
  const picture = hero?.querySelector("picture");
  const copy = hero?.querySelector(".loreal-hero-copy");
  const light = hero?.querySelector(".loreal-hero-light");
  if (hero && picture && copy && window.gsap) {
    let inView = true;
    let movers = null;
    const setup = () => {
      if (movers || reduced.matches || !finePointer.matches) return;
      hero.classList.add("has-parallax");
      // Overscan so the image edges never show while it travels.
      gsap.set(picture, { scale: 1.06 });
      movers = {
        imageX: gsap.quickTo(picture, "xPercent", { duration: 1.4, ease: "power3.out" }),
        imageY: gsap.quickTo(picture, "yPercent", { duration: 1.4, ease: "power3.out" }),
        copyX: gsap.quickTo(copy, "x", { duration: 1, ease: "power3.out" }),
        copyY: gsap.quickTo(copy, "y", { duration: 1, ease: "power3.out" }),
      };
    };
    const reset = () => {
      if (!movers) return;
      movers.imageX(0);
      movers.imageY(0);
      movers.copyX(0);
      movers.copyY(0);
      hero.classList.remove("is-lit");
    };
    const teardown = () => {
      if (!movers) return;
      gsap.killTweensOf([picture, copy]);
      gsap.set([picture, copy], { clearProps: "transform" });
      hero.classList.remove("has-parallax", "is-lit");
      movers = null;
    };
    hero.addEventListener("pointermove", (event) => {
      if (!movers || !inView) return;
      const box = hero.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      // Image travels against the pointer; the headline drifts gently with it.
      movers.imageX(x * -3.2);
      movers.imageY(y * -3.2);
      movers.copyX(x * 18);
      movers.copyY(y * 10);
      if (light) {
        light.style.setProperty("--lx", `${(x + 0.5) * 100}%`);
        light.style.setProperty("--ly", `${(y + 0.5) * 100}%`);
      }
      hero.classList.add("is-lit");
    });
    hero.addEventListener("pointerleave", reset);
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) reset();
    }).observe(hero);
    const sync = () => (reduced.matches || !finePointer.matches ? teardown() : setup());
    reduced.addEventListener("change", sync);
    finePointer.addEventListener("change", sync);
    setup();
  }

  // Service tickers: a seamless GSAP loop that surges with scroll speed and
  // eases off while hovered. Static wrapped list without GSAP or with reduced motion.
  document.querySelectorAll("[data-ticker]").forEach((ticker) => {
    const track = ticker.querySelector(".loreal-ticker-track");
    const list = track?.querySelector("ul");
    if (!list || !window.gsap) return;
    let loop = null;
    let clone = null;
    let inView = false;
    const direction = ticker.hasAttribute("data-ticker-reverse") ? -1 : 1;
    const start = () => {
      if (loop || reduced.matches) return;
      clone = list.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.removeAttribute("aria-label");
      track.append(clone);
      ticker.classList.add("is-running");
      const distance = list.offsetWidth;
      loop = gsap.fromTo(
        track,
        { x: direction > 0 ? 0 : -distance },
        {
          x: direction > 0 ? -distance : 0,
          duration: distance / 70,
          ease: "none",
          repeat: -1,
        },
      );
      loop.timeScale(1);
      if (!inView) loop.pause();
    };
    const stop = () => {
      if (!loop) return;
      loop.kill();
      loop = null;
      clone?.remove();
      gsap.set(track, { clearProps: "transform" });
      ticker.classList.remove("is-running");
    };
    let lastY = scrollY;
    let hovered = false;
    addEventListener(
      "scroll",
      () => {
        if (!loop || !inView) return;
        const speed = Math.min(6, 1 + Math.abs(scrollY - lastY) / 12);
        lastY = scrollY;
        gsap.to(loop, { timeScale: speed, duration: 0.15, overwrite: true });
        gsap.to(loop, {
          timeScale: hovered ? 0.2 : 1,
          duration: 1.2,
          delay: 0.15,
          ease: "power2.out",
        });
      },
      { passive: true },
    );
    ticker.addEventListener("pointerenter", () => {
      hovered = true;
      if (loop) gsap.to(loop, { timeScale: 0.2, duration: 0.6, overwrite: true });
    });
    ticker.addEventListener("pointerleave", () => {
      hovered = false;
      if (loop) gsap.to(loop, { timeScale: 1, duration: 0.6, overwrite: true });
    });
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (loop) inView ? loop.play() : loop.pause();
    }).observe(ticker);
    let width = innerWidth;
    addEventListener("resize", () => {
      if (innerWidth === width) return;
      width = innerWidth;
      stop();
      start();
    });
    reduced.addEventListener("change", () => (reduced.matches ? stop() : start()));
    start();
  });

  // Think services: the list ticks through its items once it scrolls into view.
  const lists = [...document.querySelectorAll(".loreal-services")];
  if (lists.length && "IntersectionObserver" in window && !reduced.matches) {
    lists.forEach((list) => {
      list.classList.add("is-checklist");
      [...list.children].forEach((item, index) =>
        item.style.setProperty("--tick-delay", `${index * 140}ms`),
      );
    });
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-ticked");
          observer.unobserve(entry.target);
        }),
      { rootMargin: "0px 0px -18% 0px" },
    );
    lists.forEach((list) => observer.observe(list));
  }

  // Next project: the film plays while hovered or focused (fine pointers only).
  const next = document.querySelector("[data-next-project]");
  const film = next?.querySelector("video");
  if (next && film) {
    const play = () => {
      if (reduced.matches || !finePointer.matches) return;
      film.play().catch(() => {});
    };
    const pause = () => film.pause();
    next.addEventListener("pointerenter", play);
    next.addEventListener("focus", play);
    next.addEventListener("pointerleave", pause);
    next.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", () => document.hidden && pause());
  }
})();
