/* ============================================================
   Rooted & Wired — shared behavior layer
   Mobile nav, scroll reveal, count-up numerals, demo forms,
   role tabs, simple filters. No dependencies.
   ============================================================ */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Keep demo strip + site header stacked when sticky ---------- */
  var strip = document.querySelector(".demo-strip");
  if (strip) {
    var setStripHeight = function () {
      document.documentElement.style.setProperty("--strip-h", strip.offsetHeight + "px");
    };
    setStripHeight();
    window.addEventListener("resize", setStripHeight);
  }

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Stagger delays for grouped reveals ---------- */
  document.querySelectorAll("[data-reveal-stagger]").forEach(function (parent) {
    var children = parent.querySelectorAll(":scope > [data-reveal]");
    children.forEach(function (el, i) {
      el.style.transitionDelay = i * 90 + "ms";
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (!reduced && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Count-up numerals ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var format = function (n, el) {
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      return prefix + Math.round(n).toLocaleString("en-US") + suffix;
    };
    var setFinal = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      el.textContent = format(target, el);
    };
    if (reduced || !("IntersectionObserver" in window)) {
      counters.forEach(setFinal);
    } else {
      var co = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            co.unobserve(entry.target);
            var el = entry.target;
            var target = parseFloat(el.getAttribute("data-count"));
            var start = null;
            var dur = 1200;
            var step = function (ts) {
              if (start === null) start = ts;
              var p = Math.min((ts - start) / dur, 1);
              var eased = 1 - Math.pow(1 - p, 3);
              el.textContent = format(target * eased, el);
              if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach(function (el) {
        co.observe(el);
      });
    }
  }

  /* ---------- Demo forms (no backend; show success state) ---------- */
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      form.classList.add("is-submitted");
      var success = form.querySelector(".form-success");
      if (success) {
        success.hidden = false;
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    });
  });

  /* ---------- Role tabs (e.g., Uplink interest form) ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (group) {
    var tabs = group.querySelectorAll('[role="tab"]');
    var panels = group.querySelectorAll('[role="tabpanel"]');
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        panels.forEach(function (p) {
          p.hidden = p.id !== tab.getAttribute("aria-controls");
        });
      });
    });
  });

  /* ---------- Simple filters (e.g., Lattice framework) ---------- */
  document.querySelectorAll("[data-filter-group]").forEach(function (group) {
    var buttons = group.querySelectorAll("[data-filter]");
    var targetSel = group.getAttribute("data-filter-target");
    var items = targetSel
      ? document.querySelectorAll(targetSel + " [data-tags]")
      : [];
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        var f = btn.getAttribute("data-filter");
        items.forEach(function (item) {
          var tags = (item.getAttribute("data-tags") || "").split(/\s+/);
          item.hidden = f !== "all" && tags.indexOf(f) === -1;
        });
      });
    });
  });
})();
