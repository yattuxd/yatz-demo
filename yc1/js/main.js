(function () {
  "use strict";

  var hamburger = document.getElementById("hamburger");
  var mainNav = document.getElementById("main-nav");
  var navOverlay = document.getElementById("nav-overlay");
  var navLinks = mainNav ? mainNav.querySelectorAll(".nav-link") : [];
  var mainEl = document.getElementById("main");
  var footerEl = document.querySelector(".site-footer");
  var fixedCtaEl = document.getElementById("fixed-cta");
  var backgroundEls = [mainEl, footerEl, fixedCtaEl].filter(Boolean);

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function scrollToHash(hash, focusTarget) {
    var target = document.querySelector(hash);
    if (!target) {
      return;
    }
    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });
    if (history.pushState) {
      history.pushState(null, "", hash);
    }
    if (focusTarget) {
      target.focus({ preventScroll: true });
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    var hash = anchor.getAttribute("href");
    if (!hash || hash === "#" || hash.length < 2) {
      return;
    }
    var isSkipLink = anchor.classList.contains("skip-link");
    anchor.addEventListener("click", function (event) {
      if (!document.querySelector(hash)) {
        return;
      }
      event.preventDefault();
      scrollToHash(hash, isSkipLink);
    });
  });

  // CTAs whose real destination is not yet set (TODO_CLIENT_VALUE) must not
  // navigate to a dead link or attempt an invalid tel: call.
  document.querySelectorAll('a[href="TODO_CLIENT_VALUE"], a[href="tel:TODO_CLIENT_VALUE"]').forEach(function (anchor) {
    anchor.setAttribute("aria-disabled", "true");
    anchor.addEventListener("click", function (event) {
      event.preventDefault();
    });
  });

  if (hamburger && mainNav && navOverlay) {
    var desktopMql = window.matchMedia("(min-width: 1024px)");

    function openNav() {
      mainNav.removeAttribute("inert");
      mainNav.classList.add("is-open");
      navOverlay.hidden = false;
      hamburger.setAttribute("aria-expanded", "true");
      hamburger.setAttribute("aria-label", "メニューを閉じる");
      document.body.style.overflow = "hidden";
      backgroundEls.forEach(function (el) {
        el.setAttribute("inert", "");
      });
      var firstLink = mainNav.querySelector(".nav-link");
      if (firstLink) {
        firstLink.focus();
      }
    }

    function closeNav() {
      mainNav.setAttribute("inert", "");
      mainNav.classList.remove("is-open");
      navOverlay.hidden = true;
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.setAttribute("aria-label", "メニューを開く");
      document.body.style.overflow = "";
      backgroundEls.forEach(function (el) {
        el.removeAttribute("inert");
      });
      hamburger.focus();
    }

    function toggleNav() {
      var isOpen = hamburger.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    }

    // At >=1024px the nav is permanently visible inline (not a collapsible
    // drawer), so it must never be inert there, and any mobile-open state
    // left over from a narrower viewport must be cleared when crossing the
    // breakpoint in either direction.
    function syncNavForViewport(event) {
      var isDesktop = event ? event.matches : desktopMql.matches;
      if (isDesktop) {
        mainNav.removeAttribute("inert");
        mainNav.classList.remove("is-open");
        navOverlay.hidden = true;
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.setAttribute("aria-label", "メニューを開く");
        document.body.style.overflow = "";
        backgroundEls.forEach(function (el) {
          el.removeAttribute("inert");
        });
      } else if (!mainNav.classList.contains("is-open")) {
        mainNav.setAttribute("inert", "");
      }
    }

    hamburger.addEventListener("click", toggleNav);
    navOverlay.addEventListener("click", closeNav);

    navLinks.forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && hamburger.getAttribute("aria-expanded") === "true") {
        closeNav();
      }
    });

    if (desktopMql.addEventListener) {
      desktopMql.addEventListener("change", syncNavForViewport);
    } else if (desktopMql.addListener) {
      desktopMql.addListener(syncNavForViewport);
    }
    syncNavForViewport();
  }
})();
