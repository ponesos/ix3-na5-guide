import { tryLoadJson, showError, loadSiteContext, bindChrome } from "./app.js";

function sortByDateDesc(items) {
  return [...items].sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
}

function renderCards(items) {
  const root = document.querySelector("[data-cards]");
  const count = document.querySelector("[data-count]");
  const list = sortByDateDesc(items);
  if (count) count.textContent = `${list.length}건`;
  if (!list.length) {
    root.innerHTML = `<p class="empty">아직 모아 둔 뉴스가 없어요.</p>`;
    return;
  }
  root.innerHTML = list
    .map((item, idx) => {
      const tags = (item.tags || [])
        .map((t) => `<span class="chip">${t}</span>`)
        .join("");
      return `<article class="item" style="animation-delay:${Math.min(idx, 8) * 0.04}s">
        <div class="chips">${tags}</div>
        <h2>${item.titleKo}</h2>
        <p class="orig">${item.outletKo} · ${item.publishedAt}</p>
        <p class="summary">${item.summaryKo}</p>
        <p><a class="btn" href="${item.url}" target="_blank" rel="noopener noreferrer">원문 읽어 보기</a></p>
      </article>`;
    })
    .join("");
}

async function main() {
  const mainEl = document.querySelector("main");
  try {
    const { meta, catalog, vehicleId, vehicle } = await loadSiteContext();
    bindChrome({ meta, catalog, vehicleId, pageTitle: vehicle?.displayNameKo });
    const news = await tryLoadJson(`data/vehicles/${vehicleId}/news.json`);
    const note = document.querySelector("[data-source-note]");
    if (note) note.textContent = news?.sourceNoteKo || "";
    renderCards(news?.items || []);
  } catch (err) {
    showError(mainEl, err);
  }
}

main();
