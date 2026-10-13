import { initNavigation } from "./navigation.js";
import { initComparisons, initFilters } from "./projects.js";

initNavigation();
initComparisons();
initFilters();
if (document.getElementById("awz-lightbox")) {
  import("./lightbox.js").then(({ initLightbox }) => initLightbox());
}
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
