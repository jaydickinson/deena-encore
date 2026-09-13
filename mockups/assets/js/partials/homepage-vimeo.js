(() => {
  const serviceMenu = document.querySelector(".service-menu");
  if (!serviceMenu) return;
  const serviceTrigger = serviceMenu.querySelector("button");
  const serviceDropdown = serviceMenu.querySelector(".submenu");
  function setServiceMenu(open) {
    serviceTrigger.setAttribute("aria-expanded", String(open));
    serviceDropdown.hidden = !open;
  }
  serviceTrigger.addEventListener("click", () =>
    setServiceMenu(serviceDropdown.hidden),
  );
  serviceTrigger.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setServiceMenu(true);
      serviceDropdown.querySelector("a").focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (!serviceMenu.contains(e.target) || e.target.closest(".submenu a"))
      setServiceMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !serviceDropdown.hidden) {
      setServiceMenu(false);
      serviceTrigger.focus();
    }
  });
  serviceMenu.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !serviceMenu.contains(event.relatedTarget))
      setServiceMenu(false);
  });
})();
(() => {
  const toggle = document.getElementById("video-toggle");
  if (!toggle || !document.getElementById("hero-film")) return;
  const watchFilm = () =>
    window.open("https://vimeo.com/1212328784", "_blank", "noopener");
  if (window.Vimeo) {
    const player = new Vimeo.Player(document.getElementById("hero-film"));
    let playing = false,
      ready = false;
    player
      .ready()
      .then(() => {
        ready = true;
        toggle.textContent = "Play video";
      })
      .catch(() => {});
    player.on("play", () => {
      document.getElementById("hero-film").style.opacity = "1";
      playing = true;
      toggle.textContent = "Pause video";
    });
    player.on("pause", () => {
      playing = false;
      toggle.textContent = "Play video";
    });
    toggle.addEventListener("click", () => {
      if (!ready) {
        watchFilm();
        return;
      }
      (playing ? player.pause() : player.play()).catch(watchFilm);
    });
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    motion.addEventListener("change", () => {
      if (motion.matches) player.pause().catch(() => {});
    });
    if (!motion.matches) player.play().catch(() => {});
  } else {
    toggle.textContent = "Watch film ↗";
    toggle.addEventListener("click", () =>
      window.open("https://vimeo.com/1212328784", "_blank", "noopener"),
    );
  }
})();
