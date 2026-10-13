export function initComparisons() {
  document.querySelectorAll("[data-comparison]").forEach((comparison) => {
    const input = comparison.querySelector('input[type="range"]');
    const before = comparison.querySelector("[data-comparison-before]");
    const handle = comparison.querySelector("[data-comparison-handle]");
    if (!input || !before || !handle) return;
    function update() {
      before.style.clipPath = `inset(0 ${100 - input.valueAsNumber}% 0 0)`;
      handle.style.left = `${input.value}%`;
    }
    input.addEventListener("input", update);
    // The homepage card is a link, but using its slider must not navigate away.
    input.addEventListener("click", (event) => event.preventDefault());
    update();
  });
}

export function initFilters() {
  const filters = document.getElementById("project-filters");
  const empty = document.getElementById("projects-empty");
  if (!filters || !empty) return;
  const buttons = [...filters.querySelectorAll("[data-filter]")];
  const cards = [...document.querySelectorAll("#featured-projects [data-category]")];
  empty.setAttribute("role", "status");
  filters.addEventListener("click", (event) => {
    const selected = event.target.closest("[data-filter]");
    if (!selected || !filters.contains(selected)) return;
    for (const button of buttons) {
      button.classList.toggle("filter-active", button === selected);
      button.setAttribute("aria-pressed", String(button === selected));
    }
    let visible = 0;
    for (const card of cards) {
      card.hidden =
        selected.dataset.filter !== "all" && card.dataset.category !== selected.dataset.filter;
      if (!card.hidden) visible++;
    }
    empty.hidden = visible > 0;
  });
}
