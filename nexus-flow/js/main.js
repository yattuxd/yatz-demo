(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(pointer: fine)");
  var header = document.querySelector("[data-header]");
  var revealItems = Array.from(document.querySelectorAll(".reveal"));
  var heroNodes = Array.from(document.querySelectorAll("[data-flow-node]"));
  var heroLines = Array.from(document.querySelectorAll(".flow-line"));
  var assembly = document.querySelector("[data-assembly]");
  var counters = Array.from(document.querySelectorAll("[data-count]"));
  var counted = false;
  var heroTimer = null;

  function setAllVisible() {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
    heroNodes.forEach(function (node) { node.classList.add("is-active"); });
    heroLines.forEach(function (line) { line.classList.add("is-active"); });
    counters.forEach(function (counter) { counter.textContent = counter.dataset.count; });
    if (assembly) { assembly.style.setProperty("--flow-progress", "100%"); }
  }

  function runHeroSequence() {
    if (reducedMotion.matches) {
      setAllVisible();
      return;
    }
    var step = 0;
    function advance() {
      if (step < heroNodes.length) {
        heroNodes[step].classList.add("is-active");
        if (step > 0 && heroLines[step - 1]) { heroLines[step - 1].classList.add("is-active"); }
        step += 1;
        heroTimer = window.setTimeout(advance, 440);
      }
    }
    heroTimer = window.setTimeout(advance, 420);
  }

  function animateCounters() {
    if (counted) { return; }
    counted = true;
    if (reducedMotion.matches) {
      counters.forEach(function (counter) { counter.textContent = counter.dataset.count; });
      return;
    }
    var start = performance.now();
    var duration = 1250;
    function frame(now) {
      var progress = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - progress, 3);
      counters.forEach(function (counter) {
        counter.textContent = String(Math.round(Number(counter.dataset.count) * eased));
      });
      if (progress < 1) { requestAnimationFrame(frame); }
    }
    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -9%", threshold: 0.12 });
    revealItems.forEach(function (item, index) {
      item.style.transitionDelay = String(Math.min(index % 4, 3) * 65) + "ms";
      revealObserver.observe(item);
    });

    var resultSection = document.getElementById("results");
    if (resultSection) {
      new IntersectionObserver(function (entries, observer) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) {
          animateCounters();
          observer.disconnect();
        }
      }, { threshold: 0.3 }).observe(resultSection);
    }
  } else {
    setAllVisible();
    counted = true;
  }

  function updateScrollEffects() {
    if (header) { header.classList.toggle("is-scrolled", window.scrollY > 24); }
    if (!assembly || reducedMotion.matches) { return; }
    var rect = assembly.getBoundingClientRect();
    var viewport = window.innerHeight;
    var progress = Math.max(0, Math.min(1, (viewport * 0.72 - rect.top) / Math.max(rect.height, 1)));
    assembly.style.setProperty("--flow-progress", (progress * 100).toFixed(1) + "%");
  }

  var scrollQueued = false;
  window.addEventListener("scroll", function () {
    if (scrollQueued) { return; }
    scrollQueued = true;
    requestAnimationFrame(function () {
      updateScrollEffects();
      scrollQueued = false;
    });
  }, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var id = link.getAttribute("href");
      if (!id || id === "#") { return; }
      var target = document.querySelector(id);
      if (!target) { return; }
      event.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
      if (history.pushState) { history.pushState(null, "", id); }
      if (link.classList.contains("skip-link")) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    });
  });

  if (finePointer.matches && !reducedMotion.matches) {
    window.addEventListener("pointermove", function (event) {
      document.documentElement.style.setProperty("--mx", event.clientX + "px");
      document.documentElement.style.setProperty("--my", event.clientY + "px");
    }, { passive: true });
  }

  reducedMotion.addEventListener("change", function (event) {
    if (event.matches) {
      if (heroTimer) { window.clearTimeout(heroTimer); }
      setAllVisible();
    }
  });

  updateScrollEffects();
  runHeroSequence();
}());
