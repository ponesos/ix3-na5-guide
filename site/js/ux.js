import { vehicleHref, currentPageName } from "./app.js";

const EXPLORE = [
  { page: "index.html", label: "모델", blurb: "제원·가격" },
  { page: "accessories.html", label: "액세서리", blurb: "품번·링크" },
  { page: "tips.html", label: "FAQ", blurb: "출고·충전" },
  { page: "reviews.html", label: "시승기", blurb: "영상" },
  { page: "news.html", label: "뉴스", blurb: "보도" },
  { page: "community.html", label: "커뮤니티", blurb: "포럼" },
  { page: "compare.html", label: "비교", blurb: "준비 중" },
  { page: "vehicles.html", label: "차종", blurb: "목록", hub: true },
];

function exploreHref(item, vehicleId) {
  if (item.hub) return item.page;
  return vehicleHref(item.page, vehicleId);
}

/**
 * Slim section rail inside sticky chrome (replaces top text nav).
 * @param {{ vehicleId?: string, isHub?: boolean }} opts
 */
export function mountExploreRail(opts = {}) {
  const { vehicleId = "", isHub = false } = opts;
  const current = currentPageName();
  const existing = document.querySelector("[data-explore]");
  if (existing) existing.remove();

  const bar = document.createElement("div");
  bar.className = "explore-bar";
  bar.setAttribute("data-explore", "");
  bar.innerHTML = `
    <div class="rail explore-rail" aria-label="섹션">
      <div class="rail-track">
        ${EXPLORE.map((item) => {
          const href = exploreHref(item, isHub ? "" : vehicleId);
          const on = item.page === current;
          return `<a class="rail-card rail-card-nav rail-card-link${on ? " is-current" : ""}" href="${href}"${
            on ? ' aria-current="page"' : ""
          }>
              <strong class="rail-card-title">${item.label}</strong>
              <span class="rail-card-meta">${item.blurb}</span>
            </a>`;
        }).join("")}
      </div>
    </div>`;

  const chrome = document.querySelector("header.chrome");
  if (chrome) {
    chrome.appendChild(bar);
  } else {
    const notice = document.querySelector(".notice");
    if (notice) notice.insertAdjacentElement("afterend", bar);
    else document.body.prepend(bar);
  }
}

/**
 * Soft scroll-in for .reveal elements.
 */
export function initReveal() {
  const nodes = [...document.querySelectorAll(".reveal:not([data-reveal-ready])")];
  if (!nodes.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    nodes.forEach((el) => {
      el.classList.add("is-in");
      el.setAttribute("data-reveal-ready", "");
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        entry.target.setAttribute("data-reveal-ready", "");
        io.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
  );

  nodes.forEach((el) => io.observe(el));
}

/**
 * Snap + padding can leave rails slightly scrolled; pin to start.
 * Current page chip scrolls into view in the top explore bar.
 */
export function resetRails() {
  document.querySelectorAll(".rail").forEach((rail) => {
    if (rail.classList.contains("explore-rail")) {
      const current = rail.querySelector(".is-current");
      if (current) {
        current.scrollIntoView({ inline: "center", block: "nearest", behavior: "auto" });
        return;
      }
    }
    rail.scrollLeft = 0;
  });
  equalizeRailHeights();
}

/**
 * Make cards in each content rail share the tallest card’s height.
 */
export function equalizeRailHeights() {
  document.querySelectorAll(".rail:not(.explore-rail) .rail-track").forEach((track) => {
    const cards = [...track.children].filter((el) => el.classList?.contains("rail-card"));
    if (cards.length < 2) return;
    cards.forEach((card) => {
      card.style.minHeight = "";
    });
    const max = Math.max(...cards.map((card) => card.getBoundingClientRect().height));
    if (!max || !Number.isFinite(max)) return;
    const px = `${Math.ceil(max)}px`;
    cards.forEach((card) => {
      card.style.minHeight = px;
    });
  });
}

/**
 * Call after chrome bind (and again after dynamic list re-renders if needed).
 * @param {{ vehicleId?: string, isHub?: boolean }} opts
 */
export function initUx(opts = {}) {
  mountExploreRail(opts);
  initReveal();
  resetRails();
  requestAnimationFrame(() => {
    resetRails();
    requestAnimationFrame(() => {
      resetRails();
      equalizeRailHeights();
    });
  });
  if (!window.__ix3RailResizeBound) {
    window.__ix3RailResizeBound = true;
    let t = 0;
    window.addEventListener("resize", () => {
      window.clearTimeout(t);
      t = window.setTimeout(equalizeRailHeights, 120);
    });
  }
}
