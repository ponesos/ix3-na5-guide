import { loadJson, showError, bindChrome, vehicleHref } from "./app.js";

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
    .map((v, idx) => {
      const code = v.codeName ? `<span class="chip chip-on">${v.codeName}</span>` : "";
      const status =
        v.status === "placeholder"
          ? `<span class="chip">준비 중</span>`
          : `<span class="chip">보기</span>`;
      const href = vehicleHref("index.html", v.id);
      return `<article class="vehicle-card" style="animation-delay:${Math.min(idx, 8) * 0.04}s">
        <div class="chips">${code}${status}</div>
        <h2>${v.displayNameKo}</h2>
        ${v.blurbKo ? `<p class="summary">${v.blurbKo}</p>` : ""}
        <p><a class="btn" href="${href}">이 차 보기</a></p>
      </article>`;
    })
    .join("");
}

async function main() {
  const mainEl = document.querySelector("main");
  try {
    const [meta, catalog] = await Promise.all([
      loadJson("data/meta.json"),
      loadJson("data/vehicles.json"),
    ]);
    bindChrome({ meta, catalog, isHub: true, pageTitle: meta.siteName });
    const lead = document.querySelector("[data-tagline]");
    if (lead) lead.textContent = meta.tagline || "";
    renderCards(catalog.items);
  } catch (err) {
    showError(mainEl, err);
  }
}

main();
