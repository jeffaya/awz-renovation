export function initNavigation() {
  const button = document.getElementById("menu-btn");
  const menu = document.getElementById("mobile-menu");
  if (!button || !menu) return;

  function setOpen(open) {
    menu.classList.toggle("hidden", !open);
    document.body.classList.toggle("no-scroll", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  }
  button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      button.focus();
    }
  });
  // A menu opened on mobile must not leave the desktop page scroll-locked.
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}
