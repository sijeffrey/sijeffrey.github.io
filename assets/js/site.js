(function () {
  var root = document.documentElement;
  var btn = document.querySelector(".theme-toggle");
  if (btn) {
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }
  // Build the contents sidebar from the post's h2 headings.
  var list = document.querySelector(".toc ol");
  if (list) {
    document.querySelectorAll(".post h2[id]").forEach(function (h) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      list.appendChild(li);
    });
  }
})();
