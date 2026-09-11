import { tryLoadJson, showError, loadSiteContext, bindChrome } from "./app.js";

function sortByDateDesc(items) {
  return [...items].sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
}

function renderChannels(channels) {
  const el = document.querySelector("[data-channels]");
  if (!el) return;
  if (!channels?.length) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `<p class="muted">자주 보는 채널: ${channels
    .map((c) =>
      c.url
        ? `<a href="${c.url}" target="_blank" rel="noopener noreferrer">${c.nameKo}</a>`
        : c.nameKo
    )
    .join(" · ")}</p>`;
}

function renderCards(items) {
  const root = document.querySelector("[data-cards]");
  const count = document.querySelector("[data-count]");
  const list = sortByDateDesc(items);
  if (count) count.textContent = `${list.length}개`;
  if (!list.length) {
    root.innerHTML = `<p class="empty">아직 올린 시승기가 없어요.</p>`;
    return;
  }
  root.innerHTML = list
    .map((item, idx) => {
      const tags = (item.tags || [])
        .map((t) => `<span class="chip">${t}</span>`)
        .join("");
      const region =
        item.region === "overseas-first"
          ? `<span class="chip">선행시승</span>`
          : item.region === "kr"
            ? `<span class="chip chip-on">국내</span>`
            : "";
      return `<article class="item" style="animation-delay:${Math.min(idx, 8) * 0.04}s">
        <div class="chips">${region}${tags}</div>
        <h2>${item.titleKo}</h2>
        <p class="orig">${item.channelKo} · ${item.publishedAt}</p>
        <p class="summary">${item.summaryKo}</p>
        <p><a class="btn" href="${item.url}" target="_blank" rel="noopener noreferrer">영상 보러 가기</a></p>
      </article>`;
    })
    .join("");
}

async function main() {
  const mainEl = document.querySelector("main");
  try {
    const { meta, catalog, vehicleId, vehicle } = await loadSiteContext();
    bindChrome({ meta, catalog, vehicleId, pageTitle: vehicle?.displayNameKo });
    const reviews = await tryLoadJson(`data/vehicles/${vehicleId}/reviews.json`);
    const note = document.querySelector("[data-source-note]");
    if (note) note.textContent = reviews?.sourceNoteKo || "";
    renderChannels(reviews?.priorityChannels);
    renderCards(reviews?.items || []);
  } catch (err) {
    showError(mainEl, err);
  }
}

main();
