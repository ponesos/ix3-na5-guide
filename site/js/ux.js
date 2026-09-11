import { vehicleHref, currentPageName } from "./app.js";

const EXPLORE = [
  { page: "index.html", label: "모델 정보", blurb: "제원 · 트림 · 가격" },
  { page: "accessories.html", label: "액세서리", blurb: "품번 · 가격 · 링크" },
  { page: "tips.html", label: "FAQ", blurb: "보조금 · 출고 · 충전" },
  { page: "reviews.html", label: "시승기", blurb: "영상 · 짧은 요약" },
  { page: "news.html", label: "뉴스", blurb: "국내 보도 요약" },
  { page: "community.html", label: "커뮤니티", blurb: "해외 포럼 메타" },
  { page: "compare.html", label: "비교", blurb: "동급 비교 준비 중" },
  { page: "vehicles.html", label: "차종", blurb: "다른 차 고르기", hub: true },
];

function exploreHref(item, vehicleId) {
  if (item.hub) return item.page;
  return vehicleHref(item.page, vehicleId);
}

/**
 * Mount “계속 탐색” snap rail before the site footer.
 * @param {{ vehicleId?: string, isHub?: boolean }} opts
 */
export function mountExploreRail(opts = {}) {
  const { vehicleId = "", isHub = false } = opts;
  const current = currentPageName();
  const existing = document.querySelector("[data-explore]");
  if (existing) existing.remove();

  const items = EXPLORE.filter((item) => item.page !== current);
  if (!items.length) return;

  const section = document.createElement("section");
  section.className = "story story-explore reveal";
  section.setAttribute("data-explore", "");
  section.innerHTML = `
    <div class="story-inner">
      <p class="story-kicker">다음으로</p>
      <h2 class="story-title">계속 살펴보기</h2>
      <p class="story-lead">옆으로 넘겨 다른 섹션으로 이어 가세요.</p>
    </div>
    <div class="rail" aria-label="다른 섹션">
      <div class="rail-track">
        ${items
          .map((item) => {
            const href = exploreHref(item, isHub ? "" : vehicleId);
            return `<a class="rail-card rail-card-link" href="${href}">
              <span class="rail-card-kicker">탐색</span>
              <strong class="rail-card-title">${item.label}</strong>
              <span class="rail-card-meta">${item.blurb}</span>
            </a>`;
          })
          .join("")}
      </div>
    </div>`;

  const footer = document.querySelector(".site-footer");
  if (footer) {
    footer.parentNode.insertBefore(section, footer);
  } else {
    document.body.appendChild(section);
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
 * Call after chrome bind (and again after dynamic list re-renders if needed).
 * @param {{ vehicleId?: string, isHub?: boolean }} opts
 */
export function initUx(opts = {}) {
  mountExploreRail(opts);
  initReveal();
}
