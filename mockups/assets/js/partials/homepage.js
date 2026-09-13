const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
// region dropdown — opens and picks, never navigates
(function () {
  const wraps = [...document.querySelectorAll(".mkt-wrap")];
  if (!wraps.length) return;
  const closeAll = () =>
    wraps.forEach((w) => {
      w.classList.remove("open");
      w.querySelector(".mkt").setAttribute("aria-expanded", "false");
    });
  wraps.forEach((w) => {
    const btn = w.querySelector(".mkt");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !w.classList.contains("open");
      closeAll();
      w.classList.toggle("open", open);
      btn.setAttribute("aria-expanded", open);
    });
    w.querySelectorAll(".mkt-menu button").forEach((b) =>
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        const r = b.dataset.region;
        document
          .querySelectorAll(".mkt")
          .forEach((m) => (m.textContent = r + " ▾"));
        document
          .querySelectorAll(".mkt-menu button")
          .forEach((x) => x.classList.toggle("on", x.dataset.region === r));
        closeAll();
      }),
    );
  });
  addEventListener("click", (e) => {
    if (!e.target.closest(".mkt-wrap")) closeAll();
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
})();
// mobile menu
(function () {
  const hamb = document.getElementById("hamb"),
    mob = document.getElementById("mobmenu");
  if (!hamb || !mob) return;
  const background = [...document.querySelectorAll("main, footer, .skip-link")];
  const brand = document.querySelector("#nav .brand");
  const links = [...mob.querySelectorAll("a")];
  function set(open, restoreFocus = false) {
    mob.inert = !open;
    background.forEach((element) => (element.inert = open));
    mob.classList.toggle("open", open);
    hamb.classList.toggle("open", open);
    hamb.setAttribute("aria-expanded", String(open));
    hamb.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) links[0]?.focus();
    else if (restoreFocus) hamb.focus();
  }
  hamb.addEventListener("click", () => set(!mob.classList.contains("open")));
  links.forEach((a) => a.addEventListener("click", () => set(false)));
  addEventListener("keydown", (event) => {
    if (!mob.classList.contains("open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      set(false, true);
    }
    if (event.key === "Tab") {
      const stops = [brand, hamb, ...links].filter(Boolean);
      const first = stops[0],
        last = stops.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  matchMedia("(min-width:1101px)").addEventListener("change", () => set(false));
})();
// reveals
const ro = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        ro.unobserve(e.target);
      }
    }),
  { threshold: 0.15 },
);
document
  .querySelectorAll(".reveal")
  .forEach((el) => (rm ? el.classList.add("in") : ro.observe(el)));
// count-up
function fmt(v, comma) {
  v = Math.round(v) + "";
  return comma ? v.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : v;
}
function animateCount(el) {
  const target = +el.dataset.count,
    suf = el.dataset.suffix || "",
    comma = el.dataset.comma === "1",
    dur = 1400,
    t0 = performance.now();
  (function step(t) {
    let p = Math.min((t - t0) / dur, 1);
    p = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(target * p, comma) + suf;
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}
const co = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting) {
        const el = e.target;
        rm
          ? (el.textContent =
              fmt(+el.dataset.count, el.dataset.comma === "1") +
              (el.dataset.suffix || ""))
          : animateCount(el);
        co.unobserve(el);
      }
    }),
  { threshold: 0.6 },
);
document.querySelectorAll("[data-count]").forEach((el) => co.observe(el));
// gems: pointer parallax at different depths (vanilla, no library) — runs in any [data-gems] section
(function () {
  if (rm) return;
  document.querySelectorAll("[data-gems]").forEach((scope) => {
    const gems = [...scope.querySelectorAll(".gem")].map((el) => ({
      el,
      d: +el.dataset.depth || 24,
      x: 0,
      y: 0,
      tx: 0,
      ty: 0,
    }));
    if (!gems.length) return;
    let raf = null;
    function tick() {
      let live = false;
      gems.forEach((g) => {
        g.x += (g.tx - g.x) * 0.08;
        g.y += (g.ty - g.y) * 0.08;
        if (Math.abs(g.tx - g.x) > 0.15 || Math.abs(g.ty - g.y) > 0.15)
          live = true;
        g.el.style.transform = `translate(${g.x}px,${g.y}px)`;
      });
      raf = live ? requestAnimationFrame(tick) : null;
    }
    scope.addEventListener("pointermove", (e) => {
      const r = scope.getBoundingClientRect();
      const nx = e.clientX / r.width - 0.5,
        ny = (e.clientY - r.top) / r.height - 0.5;
      gems.forEach((g) => {
        g.tx = nx * g.d;
        g.ty = ny * g.d;
      });
      if (!raf) raf = requestAnimationFrame(tick);
    });
  });
})();
// the brief: front-end only, no data goes anywhere
(function () {
  const f = document.getElementById("brief");
  if (!f) return;
  const submit = f.querySelector('[type="submit"]');
  const status = f.querySelector(".ok");
  submit.disabled = false;
  f.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!f.reportValidity()) return;
    status.hidden = false;
    status.focus();
  });
  f.addEventListener("input", () => {
    status.hidden = true;
  });
})();
// moving gallery: clone each track's frames once so translateX(-50%) loops seamlessly
document.querySelectorAll(".reel .track").forEach((t) => {
  [...t.children].forEach((k) => {
    const c = k.cloneNode(true);
    c.setAttribute("aria-hidden", "true");
    t.appendChild(c);
  });
});
