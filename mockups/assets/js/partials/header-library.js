(() => {
  const frame = document.querySelector(".library-frame");
  if (!frame) return;
  const choices = document.querySelectorAll("[data-header-option]");
  choices.forEach((link) =>
    link.addEventListener("click", () => {
      choices.forEach((choice) => choice.removeAttribute("aria-current"));
      link.setAttribute("aria-current", "true");
      frame.title = `${link.dataset.headerOption} header preview`;
      document.getElementById("open-header-preview").href = link.href;
    }),
  );
  const sizes = document.querySelectorAll("[data-preview-size]");
  sizes.forEach((button) =>
    button.addEventListener("click", () => {
      sizes.forEach((size) =>
        size.setAttribute("aria-pressed", String(size === button)),
      );
      frame.classList.toggle(
        "is-mobile",
        button.dataset.previewSize === "mobile",
      );
    }),
  );
})();
