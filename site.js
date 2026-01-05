(() => {
  const NAV_SELECTOR = ".site-navbar";
  const TOP_THRESHOLD_PX = 8; // still counts as "top" if user nudges slightly
  let rafId = 0;
  let lastHeight = -1;

  function isMobileNav() {
    // Match Bootstrap's lg breakpoint (navbar collapses below this)
    return window.matchMedia && window.matchMedia("(max-width: 991.98px)").matches;
  }

  function initReviewStars() {
    const form = document.querySelector('form[name="review"]');
    if (!form) return;

    const select = form.querySelector('select[name="rating"]');
    const starsWrap = form.querySelector(".review-stars");
    if (!select || !starsWrap) return;

    const stars = Array.from(starsWrap.querySelectorAll(".review-star"));

    const setFilled = (value) => {
      const v = Number(value || 0);
      stars.forEach((btn) => {
        const n = Number(btn.getAttribute("data-value"));
        btn.classList.toggle("is-filled", n <= v && v > 0);
      });
    };

    // Initial state
    setFilled(select.value);

    // Sync when dropdown changes
    select.addEventListener("change", () => setFilled(select.value));

    // Allow clicking stars to set rating (keeps Netlify form field in sync)
    starsWrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".review-star");
      if (!btn) return;
      const value = btn.getAttribute("data-value");
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  function setNavState() {
    const nav = document.querySelector(NAV_SELECTOR);
    if (!nav) return;

    const atTop =
      !isMobileNav() && (window.scrollY || window.pageYOffset || 0) <= TOP_THRESHOLD_PX;
    nav.classList.toggle("is-at-top", atTop);

    // Update page offset so content never hides under the fixed navbar
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      const h = nav.offsetHeight;
      if (h !== lastHeight) {
        lastHeight = h;
        document.documentElement.style.setProperty("--nav-offset", `${h}px`);
      }
    });
  }

  // Initialize
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        setNavState();
        initReviewStars();
      },
      { once: true }
    );
  } else {
    setNavState();
    initReviewStars();
  }

  // Update on scroll/resize
  window.addEventListener("scroll", setNavState, { passive: true });
  window.addEventListener("resize", setNavState, { passive: true });
})();


