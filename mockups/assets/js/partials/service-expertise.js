/* Expertise list: light up the item crossing the middle of the viewport. */
(() => {
  const list = document.querySelector("[data-expertise]");
  if (!list || !("IntersectionObserver" in window)) return;
  const items = [...list.children];
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        entry.target.classList.toggle("is-active", entry.isIntersecting);
    },
    { rootMargin: "-42% 0px -42% 0px" },
  );
  items.forEach((item) => observer.observe(item));
})();
