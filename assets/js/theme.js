// Set the light or dark theme before the page paints, so there is no flash.
// Loaded in <head> without defer, and kept in its own file so the CSP can use script-src 'self'.
(function () {
  var t = localStorage.getItem("theme");
  if (!t) t = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", t);
})();
