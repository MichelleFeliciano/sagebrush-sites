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

  /* ---------- Device mockup tilt (pointer devices only) ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach(function (stage) {
      var rig = stage.querySelector(".device-rig");
      if (!rig) return;
      stage.addEventListener("pointermove", function (event) {
        var box = stage.getBoundingClientRect();
        var x = (event.clientX - box.left) / box.width - 0.5;
        var y = (event.clientY - box.top) / box.height - 0.5;
        rig.classList.add("is-tilting");
        rig.style.setProperty("--ry", (x * 14).toFixed(2) + "deg");
        rig.style.setProperty("--rx", (-y * 10).toFixed(2) + "deg");
      });
      stage.addEventListener("pointerleave", function () {
        rig.classList.remove("is-tilting");
        rig.style.setProperty("--ry", "0deg");
        rig.style.setProperty("--rx", "0deg");
      });
    });
  }

  /* ---------- "Try a style" demo ---------- */
  var lab = document.getElementById("style-lab");
  if (lab) {
    lab.hidden = false;
    var mock = document.getElementById("mock");
    var gallery = document.getElementById("mock-gallery");
    var labName = document.getElementById("lab-name");
    var labDesc = document.getElementById("lab-desc");
    var labLink = document.getElementById("lab-link");

    var applyStyle = function (input) {
      mock.setAttribute("data-style", input.value);
      labName.textContent = input.getAttribute("data-title");
      labDesc.textContent = input.getAttribute("data-desc");
      labLink.setAttribute("href", input.getAttribute("data-href"));
      labLink.innerHTML = "See it on " + input.getAttribute("data-site") + " &rarr;";
      if (!reduceMotion) {
        gallery.classList.remove("pop");
        void gallery.offsetWidth; // restart the animation
        gallery.classList.add("pop");
      }
    };

    Array.prototype.forEach.call(lab.querySelectorAll('input[name="lab-style"]'), function (input) {
      input.addEventListener("change", function () {
        if (input.checked) applyStyle(input);
      });
    });
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
