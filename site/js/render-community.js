import { tryLoadJson, showError, loadSiteContext, bindChrome } from "./app.js";
import { initUx, initReveal } from "./ux.js";

const state = { items: [], sort: "latest", source: null };

function sorted(items) {
  const list = [...items];
  if (state.sort === "popular") {
    return list.sort((a, b) => {
      const ar = a.replies ?? 0;
      const br = b.replies ?? 0;
      if (br !== ar) return br - ar;
      return (b.views ?? 0) - (a.views ?? 0);
    });
  }
  return list.sort((a, b) => {
    const d = (b.lastActivityAt || "").localeCompare(a.lastActivityAt || "");
    if (d !== 0) return d;
    return (b.id || "").localeCompare(a.id || "");
  });
}

function formatMeta(item) {
  const parts = [item.lastActivityAt];
  if (typeof item.replies === "number") parts.push(`댓글 ${item.replies.toLocaleString("ko-KR")}`);
  if (typeof item.views === "number" && item.views > 0) {
    parts.push(`조회 ${item.views.toLocaleString("ko-KR")}`);
  }
  return parts.join(" · ");
}

function isBoardOnly(url) {
  return /\/forum\/[^/]+-b\d+\.html/i.test(url || "");
}

function renderCards() {
  const root = document.querySelector("[data-cards]");
  const count = document.querySelector("[data-count]");
  const list = sorted(state.items);
  if (count) count.textContent = `${list.length}개`;
  if (!list.length) {
    root.innerHTML = `<p class="empty" style="margin:0 var(--pad)">아직 올린 글이 없어요.</p>`;
    return;
  }
  root.innerHTML = `<div class="rail" aria-label="커뮤니티"><div class="rail-track">${list
    .map((item) => {
      const pin = item.pinned ? `<span class="chip">고정</span>` : "";
      const orig = item.titleOriginal || "";
      const primaryLabel = isBoardOnly(item.url) ? "게시판 열기" : "이야기 보러 가기";
      const linkBlock = item.url
        ? `<p class="actions"><a class="btn" href="${item.url}" target="_blank" rel="noopener noreferrer">${primaryLabel}</a></p>`
        : `<p class="muted">링크가 아직 없어요</p>`;
      return `<article class="rail-card rail-card-wide">
        <div class="chips">${pin}<span class="chip chip-on">해외</span><span class="chip">DE</span></div>
        <strong class="rail-card-title">${item.titleKo}</strong>
        ${orig ? `<p class="orig">${orig}</p>` : ""}
        <p class="rail-card-meta">${formatMeta(item)}</p>
        <p class="summary" style="flex:1">${item.summaryKo}</p>
        ${linkBlock}
      </article>`;
    })
    .join("")}</div></div>`;
  initReveal();
}

function bindSort() {
  const sortRow = document.querySelector("[data-sort]");
  sortRow?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-sort-btn]");
    if (!btn) return;
    state.sort = btn.getAttribute("data-sort-btn") || "latest";
    sortRow.querySelectorAll("[data-sort-btn]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b === btn));
    });
    renderCards();
  });
}

async function main() {
  const mainEl = document.querySelector("main");
  try {
    const { meta, catalog, vehicleId, vehicle } = await loadSiteContext();
    bindChrome({ meta, catalog, vehicleId, pageTitle: vehicle?.displayNameKo });
    initUx({ vehicleId });
    const forum = await tryLoadJson(`data/vehicles/${vehicleId}/forum.json`);
    state.source = forum;
    state.items = forum?.items || [];
    const note = document.querySelector("[data-source-note]");
    if (note) note.textContent = forum?.sourceNoteKo || "";
    const link = document.querySelector("[data-source-link]");
    if (link) {
      link.innerHTML =
        forum?.source?.url
          ? `<a href="${forum.source.url}" target="_blank" rel="noopener noreferrer">${forum.source.name || "MOTOR-TALK"}</a>에서 더 보기`
          : "";
    }
    bindSort();
    renderCards();
  } catch (err) {
    showError(mainEl, err);
  }
}

main();
