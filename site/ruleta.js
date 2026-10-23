(function () {
  var CAROUSEL = '[role="group"][aria-label^="Carrusel"]';

  function isHydrated(el) {
    return Object.keys(el).some(function (k) {
      return k.indexOf("__reactFiber") === 0 || k.indexOf("__reactProps") === 0;
    });
  }

  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = list[i];
      list[i] = list[j];
      list[j] = t;
    }
    return list;
  }

  function catalogCards() {
    return Array.prototype.slice
      .call(document.querySelectorAll("#catalogo ul > li > button"))
      .map(function (btn) {
        var img = btn.querySelector("img");
        var h3 = btn.querySelector("h3");
        var cat = btn.querySelector("span.text-brand-pink");
        if (!img || !h3) return null;
        return {
          src: img.getAttribute("src"),
          name: h3.textContent.trim(),
          category: cat ? cat.textContent.trim() : "",
        };
      })
      .filter(Boolean);
  }

  function findCard(name) {
    var buttons = document.querySelectorAll("#catalogo ul > li > button");
    for (var i = 0; i < buttons.length; i++) {
      var h3 = buttons[i].querySelector("h3");
      if (h3 && h3.textContent.trim() === name) return buttons[i];
    }
    return null;
  }

  function randomize(figures) {
    var pool = shuffle(catalogCards());
    if (pool.length < figures.length) return;
    figures.forEach(function (fig, i) {
      var p = pool[i];
      var img = fig.querySelector("img");
      var spans = fig.querySelectorAll("figcaption span");
      if (img) {
        img.removeAttribute("srcset");
        img.setAttribute("src", p.src);
        img.setAttribute("alt", p.name);
      }
      if (spans[0]) spans[0].textContent = p.name;
      if (spans[1]) spans[1].textContent = p.category;
    });
  }

  function enableClicks(group, figures) {
    var startX = 0;
    var startY = 0;
    group.addEventListener(
      "pointerdown",
      function (e) {
        startX = e.clientX;
        startY = e.clientY;
      },
      true
    );
    figures.forEach(function (fig) {
      fig.style.cursor = "pointer";
      fig.setAttribute("role", "button");
      fig.setAttribute("tabindex", "0");
      var open = function () {
        var span = fig.querySelector("figcaption span");
        if (!span) return;
        var name = span.textContent.trim();
        fig.setAttribute("aria-label", "Ver " + name);
        var card = findCard(name);
        if (card) {
          card.click();
        } else {
          var cat = document.getElementById("catalogo");
          if (cat) cat.scrollIntoView({ behavior: "smooth" });
        }
      };
      fig.addEventListener("click", function (e) {
        if (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8) return;
        open();
      });
      fig.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });
  }

  var tries = 0;
  function init() {
    var group = document.querySelector(CAROUSEL);
    if (!group) return;
    var figures = Array.prototype.slice.call(group.querySelectorAll("figure"));
    if (!figures.length) return;
    if (!isHydrated(figures[0]) && tries++ < 60) {
      setTimeout(init, 100);
      return;
    }
    randomize(figures);
    enableClicks(group, figures);
  }

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init);
})();
