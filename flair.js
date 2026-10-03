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

  /* ---------- Concept-work carousel ---------- */
  var showcase = document.getElementById("showcase");
  if (showcase) {
    var slides = Array.prototype.slice.call(showcase.querySelectorAll(".slide"));
    var body = showcase.querySelector(".showcase-body");
    if (slides.length > 1 && body) {
      showcase.classList.add("is-carousel");
      var current = 0;
      var playing = !reduceMotion;
      var hovering = false;
      var focusing = false;
      var timer = null;

      var controls = document.createElement("div");
      controls.className = "carousel-controls";

      var prev = document.createElement("button");
      prev.type = "button";
      prev.className = "carousel-btn";
      prev.setAttribute("aria-label", "Previous concept site");
      prev.innerHTML = "&lsaquo;";

      var dotsWrap = document.createElement("div");
      dotsWrap.className = "carousel-dots";
      var dots = slides.map(function (slide, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", "Show concept site " + (i + 1) + " of " + slides.length);
        dot.addEventListener("click", function () { show(i); tick(); });
        dotsWrap.appendChild(dot);
        return dot;
      });

      var next = document.createElement("button");
      next.type = "button";
      next.className = "carousel-btn";
      next.setAttribute("aria-label", "Next concept site");
      next.innerHTML = "&rsaquo;";

      var toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "carousel-toggle";

      controls.appendChild(prev);
      controls.appendChild(dotsWrap);
      controls.appendChild(next);
      controls.appendChild(toggle);
      body.appendChild(controls);

      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          var active = i === current;
          slide.classList.toggle("is-active", active);
          if (active) { slide.removeAttribute("inert"); } else { slide.setAttribute("inert", ""); }
          dots[i].setAttribute("aria-current", active ? "true" : "false");
        });
      };

      var tick = function () {
        if (timer) { window.clearInterval(timer); timer = null; }
        if (playing && !hovering && !focusing && !document.hidden) {
          timer = window.setInterval(function () { show(current + 1); }, 5500);
        }
      };

      var syncToggle = function () {
        toggle.textContent = playing ? "Pause rotation" : "Play rotation";
        body.setAttribute("aria-live", playing ? "off" : "polite");
      };

      prev.addEventListener("click", function () { show(current - 1); tick(); });
      next.addEventListener("click", function () { show(current + 1); tick(); });
      toggle.addEventListener("click", function () { playing = !playing; syncToggle(); tick(); });
      body.addEventListener("pointerenter", function () { hovering = true; tick(); });
      body.addEventListener("pointerleave", function () { hovering = false; tick(); });
      body.addEventListener("focusin", function () { focusing = true; tick(); });
      body.addEventListener("focusout", function () { focusing = false; tick(); });
      document.addEventListener("visibilitychange", tick);

      show(0);
      syncToggle();
      tick();
    }
  }

  /* ---------- Floating "Get a free quote" button ---------- */
  if (!/contact/i.test(window.location.pathname)) {
    var quote = document.createElement("a");
    quote.className = "quote-fab";
    quote.href = "contact.html";
    quote.textContent = "Get a free quote";
    document.body.appendChild(quote);

    var quoteShown = false;
    var checkQuote = function () {
      var shouldShow = window.scrollY > 480;
      if (shouldShow !== quoteShown) {
        quoteShown = shouldShow;
        quote.classList.toggle("is-shown", shouldShow);
      }
    };
    window.addEventListener("scroll", checkQuote, { passive: true });
    checkQuote();
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
