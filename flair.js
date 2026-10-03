/* Sagebrush Sites: flair layer. Plain JavaScript, no dependencies.
   Every effect is skipped for visitors who prefer reduced motion. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll-in reveals ---------- */
  var REVEAL = [
    ".section-head", ".work-card", ".process-card", ".process-note", ".work-note",
    ".about-arch", ".about-copy", ".skill-chip", ".fact", ".contact-info",
    ".contact-grid form"
  ].join(",");

  if (!reduceMotion && "IntersectionObserver" in window) {
    var seen = new Map();
    var targets = Array.prototype.slice.call(document.querySelectorAll(REVEAL));

    targets.forEach(function (el) {
      var parent = el.parentElement;
      var index = seen.get(parent) || 0;
      seen.set(parent, index + 1);
      el.style.setProperty("--d", Math.min(index, 6) * 0.08 + "s");
      el.classList.add("reveal");
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          observer.unobserve(el);
          el.classList.add("in");
          // Hand control back to the element's own hover transitions.
          el.addEventListener("transitionend", function done(event) {
            if (event.propertyName !== "opacity") return;
            el.removeEventListener("transitionend", done);
            el.classList.remove("reveal", "in");
            el.style.removeProperty("--d");
          });
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Scroll progress bar ---------- */
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  var ticking = false;
  function updateProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    bar.style.setProperty("--p", max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
})();
