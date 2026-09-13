(() => {
  document.querySelectorAll("[data-case-video]").forEach((section) => {
    const player = section.querySelector(".case-video-player");
    const button = section.querySelector(".case-video-play");
    button.addEventListener(
      "click",
      () => {
        const frame = document.createElement("iframe");
        frame.src = `${player.dataset.embedUrl}?autoplay=1&playsinline=1&dnt=1`;
        frame.title = player.dataset.videoTitle;
        frame.allow = "autoplay; fullscreen; picture-in-picture";
        frame.allowFullscreen = true;
        player.replaceChildren(frame);
        frame.focus();
      },
      { once: true },
    );
  });
})();
