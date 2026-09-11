import { tryLoadJson, showError, loadSiteContext, bindChrome } from "./app.js";
import { initUx, initReveal, resetRails } from "./ux.js";

function sortByDateDesc(items) {
  return [...items].sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
}

function renderCards(items) {
  const root = document.querySelector("[data-cards]");
  const count = document.querySelector("[data-count]");
  const list = sortByDateDesc(items);
  if (count) count.textContent = `${list.length}건`;
  if (!list.length) {
    root.innerHTML = `<p class="empty" style="margin:0 var(--pad)">아직 모아 둔 뉴스가 없어요.</p>`;
    return;
  }
  root.innerHTML = `<div class="rail" aria-label="뉴스"><div class="rail-track">${list
    .map((item) => {
      const tags = (item.tags || []).map((t) => `<span class="chip">${t}</span>`).join("");
      return `<article class="rail-card rail-card-wide">
        <div class="chips">${tags}</div>
        <strong class="rail-card-title">${item.titleKo}</strong>
        <p class="rail-card-meta">${item.outletKo} · ${item.publishedAt}</p>
        <p class="summary" style="flex:1">${item.summaryKo}</p>
        <p><a class="btn" href="${item.url}" target="_blank" rel="noopener noreferrer">원문 읽어 보기</a></p>
      </article>`;
    })
    .join("")}</div></div>`;
  initReveal();
  resetRails();
}

async function main() {
  const mainEl = document.querySelector("main");
  try {
    const { meta, catalog, vehicleId, vehicle } = await loadSiteContext();
    bindChrome({ meta, catalog, vehicleId, pageTitle: vehicle?.displayNameKo });
    initUx({ vehicleId });
    const news = await tryLoadJson(`data/vehicles/${vehicleId}/news.json`);
    const note = document.querySelector("[data-source-note]");
    if (note) note.textContent = news?.sourceNoteKo || "";
    renderCards(news?.items || []);
  } catch (err) {
    showError(mainEl, err);
  }
}

main();
