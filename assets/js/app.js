import { initNavigation } from "./navigation.js";

initNavigation();
if (document.querySelector("[data-comparison], #project-filters")) {
  import("./projects.js");
}
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
