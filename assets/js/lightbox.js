export function initLightbox() {
  const box = document.getElementById("awz-lightbox");
  const picture = document.getElementById("awz-lightbox-image");
  const closeButton = document.getElementById("awz-lightbox-close");
  if (!box || !picture || !closeButton) return;
  let previousFocus;
  let previousOverflow;
  let background = [];

  function open(image) {
    previousFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    picture.src = image.currentSrc || image.src;
    picture.alt = image.alt;
    box.classList.add("is-open");
    box.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    background = [...document.body.children]
      .filter((element) => element !== box)
      .map((element) => [element, element.inert]);
    for (const [element] of background) element.inert = true;
    closeButton.focus();
  }
  function close() {
    if (!box.classList.contains("is-open")) return;
    box.classList.remove("is-open");
    box.setAttribute("aria-hidden", "true");
    picture.removeAttribute("src");
    document.body.style.overflow = previousOverflow;
    for (const [element, inert] of background) element.inert = inert;
    previousFocus?.focus({ preventScroll: true });
  }
  document.querySelectorAll("img.awz-zoomable").forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-haspopup", "dialog");
    image.setAttribute("aria-label", `Agrandir : ${image.alt}`);
  });
  document.addEventListener("click", (event) => {
    const image = event.target.closest("img.awz-zoomable");
    if (image) open(image);
    else if (event.target === box || event.target.closest("#awz-lightbox-close")) close();
  });
  document.addEventListener("keydown", (event) => {
    if (box.classList.contains("is-open")) {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        event.preventDefault();
        closeButton.focus();
      }
    } else if (event.target.matches("img.awz-zoomable") && ["Enter", " "].includes(event.key)) {
      event.preventDefault();
      open(event.target);
    }
  });
}
