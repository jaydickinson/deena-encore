(() => {
  const strip = document.querySelector("#loreal-filmstrip");
  if (!strip) return;
  const previous = document.querySelector("[data-filmstrip-prev]");
  const next = document.querySelector("[data-filmstrip-next]");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const slides = [...strip.children];
  const proxy = document.createElement("div");
  let drag;
  let tween;
  const maxScroll = () => Math.max(0, strip.scrollWidth - strip.clientWidth);
  function update() {
    previous.disabled = strip.scrollLeft < 2;
    next.disabled = strip.scrollLeft >= maxScroll() - 2;
  }
  function move(direction) {
    const offset = slides[0].offsetLeft;
    const positions = slides.map((slide) => slide.offsetLeft - offset);
    const target =
      direction > 0
        ? positions.find((x) => x > strip.scrollLeft + 4)
        : positions.findLast((x) => x < strip.scrollLeft - 4);
    if (target === undefined) return;
    tween?.kill();
    drag?.tween?.kill();
    if (window.gsap && !reduced.matches)
      tween = gsap.to(strip, {
        scrollLeft: Math.min(target, maxScroll()),
        duration: 0.55,
        ease: "power3.out",
        overwrite: true,
      });
    else strip.scrollTo({ left: target, behavior: "instant" });
  }
  function setupDrag() {
    drag?.kill();
    if (!window.gsap || !window.Draggable) return;
    gsap.registerPlugin(Draggable);
    if (window.InertiaPlugin) gsap.registerPlugin(InertiaPlugin);
    strip.classList.add("is-draggable");
    gsap.set(proxy, { x: -strip.scrollLeft });
    [drag] = Draggable.create(proxy, {
      type: "x",
      trigger: strip,
      bounds: { minX: -maxScroll(), maxX: 0 },
      inertia: !reduced.matches && Boolean(window.InertiaPlugin),
      edgeResistance: 1,
      overshootTolerance: 0,
      minimumMovement: 6,
      allowNativeTouchScrolling: true,
      cursor: "grab",
      activeCursor: "grabbing",
      onPressInit() {
        tween?.kill();
        this.tween?.kill();
        gsap.set(proxy, { x: -strip.scrollLeft });
        this.update();
      },
      onDragStart() {
        strip.classList.add("is-dragging");
      },
      onDrag() {
        strip.scrollLeft = -this.x;
        update();
      },
      onThrowUpdate() {
        strip.scrollLeft = -this.x;
        update();
      },
      onRelease() {
        strip.classList.remove("is-dragging");
      },
    });
  }
  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  strip.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    }
  });
  strip.addEventListener("scroll", update, { passive: true });
  strip.addEventListener(
    "wheel",
    () => {
      tween?.kill();
      drag?.tween?.kill();
    },
    { passive: true },
  );
  strip.querySelectorAll("img").forEach((image) => {
    image.draggable = false;
  });
  new ResizeObserver(() => {
    drag?.tween?.kill();
    drag?.applyBounds({ minX: -maxScroll(), maxX: 0 });
    update();
  }).observe(strip);
  const hero = document.querySelector(".loreal-hero");
  if (hero)
    new IntersectionObserver(
      ([entry]) =>
        document.body.classList.toggle("has-scrolled", !entry.isIntersecting),
      { rootMargin: "-95px 0px 0px 0px" },
    ).observe(hero);
  reduced.addEventListener("change", () => {
    tween?.kill();
    drag?.tween?.kill();
    setupDrag();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      tween?.kill();
      drag?.tween?.kill();
    }
  });
  setupDrag();
  update();
})();
