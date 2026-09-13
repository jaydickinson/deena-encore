/* Shared navigation only. Page-specific behaviour remains in its own page. */
(() => {
  "use strict";
  const header = document.querySelector(".site-header");
  if (!header) return;
  const menu = header.querySelector(".site-nav");
  const menuButton = header.querySelector(".site-menu-toggle");
  const service = header.querySelector(".site-service-menu");
  const serviceButton = header.querySelector(".site-service-trigger");
  const submenu = header.querySelector(".site-submenu");
  function setServices(open) {
    submenu.hidden = !open;
    serviceButton.setAttribute("aria-expanded", String(open));
  }
  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.textContent = open ? "Close ×" : "Menu +";
    if (!open) setServices(false);
  }
  serviceButton.addEventListener("click", () => setServices(submenu.hidden));
  serviceButton.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setServices(true);
      submenu.querySelector("a").focus();
    }
  });
  menuButton.addEventListener("click", () =>
    setMenu(!menu.classList.contains("is-open")),
  );
  document.addEventListener("click", (event) => {
    if (!service.contains(event.target)) setServices(false);
    if (!header.contains(event.target)) setMenu(false);
  });
  header.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!submenu.hidden) {
      setServices(false);
      serviceButton.focus();
    } else if (menu.classList.contains("is-open")) {
      setMenu(false);
      menuButton.focus();
    }
  });
  // Safari may send focus to the body on pointer-down on a link.
  // Only close for a known keyboard focus destination; outside clicks close separately.
  service.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !service.contains(event.relatedTarget))
      setServices(false);
  });
  header.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !header.contains(event.relatedTarget))
      setMenu(false);
  });
  menu
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => setMenu(false)));
  const desktop = matchMedia("(min-width:1101px)");
  desktop.addEventListener("change", () => setMenu(false));
  const filename = location.pathname.split("/").pop();
  menu.querySelectorAll("a").forEach((link) => {
    if (link.getAttribute("href") === filename)
      link.setAttribute("aria-current", "page");
  });
})();
