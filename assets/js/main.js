/* American Foundations & Crawlspaces — site behaviour
   No dependencies. Progressive enhancement only: every page works without JS. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var header = document.querySelector(".site-header");

  /* The logo medallion starts full size and overhangs the bar; it has to be
     tucked away while the drawer is open, or it would sit on the first link.
     Scroll and drawer both feed the one class the CSS reads. */
  var scrolledPast = false;
  var drawerOpen = false;

  var syncHeader = function () {
    if (header) header.classList.toggle("is-shrunk", scrolledPast || drawerOpen);
  };

  /* ---------------------------------------------------------------- Nav */
  var toggle = document.querySelector("[data-nav-toggle]");
  var drawer = document.getElementById("mobile-drawer");

  if (toggle && drawer) {
    var setDrawer = function (open) {
      drawerOpen = open;
      toggle.setAttribute("aria-expanded", String(open));
      drawer.classList.toggle("is-open", open);
      syncHeader();
    };

    toggle.addEventListener("click", function () {
      setDrawer(toggle.getAttribute("aria-expanded") !== "true");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) {
        setDrawer(false);
        toggle.focus();
      }
    });

    // Close the drawer if the viewport grows into desktop layout.
    window.matchMedia("(min-width: 68rem)").addEventListener("change", function (e) {
      if (e.matches) setDrawer(false);
    });
  }

  /* ------------------------------------------------------- Sticky header */
  if (header) {
    // Two thresholds, not one: the medallion only springs back to full size
    // near the very top, so scrolling around the trigger point cannot flap it.
    var SHRINK_AT = 56;
    var EXPAND_AT = 16;

    var onScroll = function () {
      var y = window.scrollY;
      header.classList.toggle("is-stuck", y > 12);
      if (y > SHRINK_AT) scrolledPast = true;
      else if (y < EXPAND_AT) scrolledPast = false;
      syncHeader();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ----------------------------------------------------- Scroll reveals */
  var revealables = document.querySelectorAll("[data-reveal]");
  if (revealables.length) {
    if (reduced || !("IntersectionObserver" in window)) {
      revealables.forEach(function (el) {
        el.classList.add("is-in");
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
      );

      revealables.forEach(function (el, i) {
        // Stagger siblings that share a parent so groups cascade in.
        var sibs = el.parentElement ? el.parentElement.querySelectorAll(":scope > [data-reveal]") : [];
        var idx = Array.prototype.indexOf.call(sibs, el);
        el.style.setProperty("--delay", Math.min(idx < 0 ? 0 : idx, 6) * 85 + "ms");
        io.observe(el);
      });
    }
  }

  /* ----------------------------------------- FAQ: one panel open at a time */
  document.querySelectorAll("[data-accordion]").forEach(function (group) {
    var items = group.querySelectorAll("details");
    items.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) return;
        items.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  });

  /* -------------------------------------------------- Hero photo slider
     Crossfades every 6s. Reduced-motion visitors start paused; the pause
     button, a hidden tab and hover/focus all stop the rotation. */
  var slider = document.querySelector("[data-slider]");
  var controls = document.querySelector("[data-slider-controls]");
  if (slider && controls) {
    var slides = slider.querySelectorAll(".hero__slide");
    var dotsWrap = controls.querySelector("[data-slider-dots]");
    var caption = controls.querySelector("[data-slider-caption]");
    var pauseBtn = controls.querySelector("[data-slider-pause]");
    var current = 0;
    var timer = null;
    var userPaused = reduced;
    var hovering = false;
    var dots = [];

    var show = function (n) {
      current = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        s.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (d, i) {
        d.setAttribute("aria-current", String(i === current));
      });
      var cap = slides[current].querySelector("figcaption");
      caption.textContent = cap ? cap.textContent : "";
    };

    var stop = function () {
      clearInterval(timer);
      timer = null;
    };
    var start = function () {
      stop();
      if (userPaused || hovering || document.hidden) return;
      timer = setInterval(function () {
        show(current + 1);
      }, 6000);
    };

    slides.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show photo " + (i + 1) + " of " + slides.length);
      b.addEventListener("click", function () {
        show(i);
        start();
      });
      dotsWrap.appendChild(b);
      dots.push(b);
    });

    var syncPause = function () {
      pauseBtn.setAttribute("aria-pressed", String(userPaused));
      pauseBtn.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
    };
    pauseBtn.addEventListener("click", function () {
      userPaused = !userPaused;
      syncPause();
      start();
    });

    controls.addEventListener("mouseenter", function () {
      hovering = true;
      stop();
    });
    controls.addEventListener("mouseleave", function () {
      hovering = false;
      start();
    });
    document.addEventListener("visibilitychange", start);

    if (slides.length > 1) {
      controls.hidden = false;
      syncPause();
      show(0);
      start();
    }
  }

  /* --------------------------------------------------------- Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ------------------------------------------------------ Estimate form */
  var form = document.querySelector("[data-estimate-form]");
  if (form) {
    var status = form.querySelector("[data-form-status]");

    var setError = function (field, message) {
      var input = field.querySelector("input, select, textarea");
      var slot = field.querySelector(".field__error");
      if (!input) return true;
      if (message) {
        input.setAttribute("aria-invalid", "true");
        if (slot) slot.textContent = message;
        return false;
      }
      input.removeAttribute("aria-invalid");
      if (slot) slot.textContent = "";
      return true;
    };

    form.addEventListener("submit", function (e) {
      var firstBad = null;
      var ok = true;

      form.querySelectorAll(".field").forEach(function (field) {
        var input = field.querySelector("input, select, textarea");
        if (!input || !input.required) return;

        var value = (input.value || "").trim();
        var message = "";

        if (!value) {
          message = "Required";
        } else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          message = "Enter a valid email address";
        } else if (input.type === "tel" && (value.replace(/\D/g, "").length < 10)) {
          message = "Enter a 10-digit phone number";
        }

        if (!setError(field, message)) {
          ok = false;
          if (!firstBad) firstBad = input;
        }
      });

      if (!ok) {
        e.preventDefault();
        if (status) {
          status.setAttribute("data-state", "error");
          status.textContent = "Please correct the highlighted fields and resubmit.";
        }
        if (firstBad) firstBad.focus();
        return;
      }

      // No form handler is wired up yet (see README, "Before launch").
      // Until an endpoint is set on the <form action>, stop here rather than
      // dropping the visitor on a broken page.
      if (!form.getAttribute("action")) {
        e.preventDefault();
        if (status) {
          status.setAttribute("data-state", "error");
          status.textContent =
            "This form is not connected to an inbox yet. Please call or email us and we will get right back to you.";
        }
      }
    });
  }
})();
