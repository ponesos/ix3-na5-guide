import { loadJson, showError, bindChrome, vehicleHref } from "./app.js";
import { initUx, initReveal, resetRails } from "./ux.js";

function renderCards(items) {
  const root = document.querySelector("[data-vehicles]");
  const count = document.querySelector("[data-count]");
  const list = items || [];
  if (count) count.textContent = `${list.length}종`;
  if (!list.length) {
    root.innerHTML = `<p class="empty">아직 등록된 차종이 없어요.</p>`;
    return;
  }
  root.innerHTML = list
    .map((v) => {
      const code = v.codeName ? `<span class="chip chip-on">${v.codeName}</span>` : "";
      const status =
        v.status === "placeholder"
          ? `<span class="chip">준비 중</span>`
          : `<span class="chip chip-on">바로 보기</span>`;
      const href = vehicleHref("index.html", v.id);
      return `<a class="rail-card rail-card-wide rail-card-link" href="${href}">
        <div class="chips">${code}${status}</div>
        <strong class="rail-card-title">${v.displayNameKo}</strong>
        ${v.blurbKo ? `<span class="rail-card-meta">${v.blurbKo}</span>` : ""}
        <span class="btn" style="align-self:flex-start;margin-top:auto;pointer-events:none">이 차 보기</span>
      </a>`;
    })
    .join("");
  initReveal();
  resetRails();
}

async function main() {
  const mainEl = document.querySelector("main");
  try {
    const [meta, catalog] = await Promise.all([
      loadJson("data/meta.json"),
      loadJson("data/vehicles.json"),
    ]);
    bindChrome({ meta, catalog, isHub: true, pageTitle: meta.siteName });
    initUx({ isHub: true });
    const lead = document.querySelector("[data-tagline]");
    if (lead) {
      const countBit = `<span data-count></span>`;
      lead.innerHTML = `${meta.tagline || "보고 싶은 차를 골라 주세요."} ${countBit}`;
    }
    renderCards(catalog.items);
  } catch (err) {
    showError(mainEl, err);
  }
}

main();
