import { loadJson, showError, bindHeader } from "./app.js";

const VEHICLE_ID = "na5-ix3";

const CATEGORY_KO = {
  purchase: "구매·보조금",
  delivery: "배정·출고",
  trim: "트림·옵션",
  charging: "충전",
  software: "앱·기능",
  accessory: "액세서리",
  finance: "금융·보험",
  ownership: "소유·관리",
};

const state = { items: [], category: "all" };

function filtered() {
  if (state.category === "all") return state.items;
  return state.items.filter((i) => i.category === state.category);
}

function renderFilters() {
  const cats = ["all", ...new Set(state.items.map((i) => i.category))];
  const box = document.querySelector("[data-filter-category]");
  box.innerHTML =
    `<span>분류</span>` +
    cats
      .map((c) => {
        const label = c === "all" ? "전체" : CATEGORY_KO[c] || c;
        return `<button type="button" data-cat="${c}" aria-pressed="${state.category === c}">${label}</button>`;
      })
      .join("");
  box.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.category = btn.getAttribute("data-cat");
      renderFilters();
      renderCards();
    });
  });
}

function renderCards() {
  const root = document.querySelector("[data-cards]");
  const list = filtered();
  const count = document.querySelector("[data-count]");
  if (count) count.textContent = `${list.length}개`;
  if (!list.length) {
    root.innerHTML = `<p class="empty">항목이 없습니다.</p>`;
    return;
  }
  root.innerHTML = list
    .map((item) => {
      const caveat = item.caveatKo
        ? `<p class="muted">${item.caveatKo}</p>`
        : "";
      const tags = (item.tags || [])
        .map((t) => `<span class="chip">${t}</span>`)
        .join("");
      return `<article class="card tip-card">
        <div><span class="chip">${CATEGORY_KO[item.category] || item.category}</span> ${tags}</div>
        <h2>${item.titleKo}</h2>
        <p class="tip-q"><strong>Q.</strong> ${item.questionKo}</p>
        <p class="tip-a"><strong>A.</strong> ${item.answerKo}</p>
        ${caveat}
        <p class="muted">근거: 오너 커뮤니티 요약${item.asOf ? ` · ${item.asOf}` : ""} · ${item.confidence}</p>
      </article>`;
    })
    .join("");
}

async function main() {
  const mainEl = document.querySelector("main");
  try {
    const [meta, tips] = await Promise.all([
      loadJson("data/meta.json"),
      loadJson(`data/vehicles/${VEHICLE_ID}/tips.json`),
    ]);
    bindHeader(meta);
    state.items = tips.items || [];
    const note = document.querySelector("[data-source-note]");
    if (note) note.textContent = tips.sourceNoteKo || "";
    const hl = document.querySelector("[data-highlights]");
    if (hl && tips.highlights?.length) {
      hl.innerHTML = `<ul>${tips.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>`;
    }
    renderFilters();
    renderCards();
  } catch (err) {
    showError(mainEl, err);
  }
}

main();
