/* American Foundations & Crawlspaces — site behaviour
   No dependencies. Progressive enhancement only: every page works without JS. */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- Nav */
  var toggle = document.querySelector("[data-nav-toggle]");
  var drawer = document.getElementById("mobile-drawer");

  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      drawer.classList.toggle("is-open", !open);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) {
        drawer.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });

    // Close the drawer if the viewport grows into desktop layout.
    window.matchMedia("(min-width: 68rem)").addEventListener("change", function (e) {
      if (e.matches) {
        drawer.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------------------------------- Sticky header */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 12);
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
