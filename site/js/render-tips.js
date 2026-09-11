import { tryLoadJson, showError, loadSiteContext, bindChrome } from "./app.js";
import { initUx, initReveal } from "./ux.js";

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

const CONFIDENCE_KO = {
  confirmed: "공식·보도로 확인",
  inferred: "자료 보고 짐작",
  unverified: "아직 확인 전",
  community: "오너들 체감",
};

function evidenceLine(item) {
  const label = CONFIDENCE_KO[item.confidence] || "";
  const parts = [label, item.asOf].filter(Boolean);
  return parts.length ? `<p class="muted">${parts.join(" · ")}</p>` : "";
}

function renderCards() {
  const root = document.querySelector("[data-cards]");
  const list = filtered();
  const count = document.querySelector("[data-count]");
  if (count) count.textContent = `${list.length}개`;
  if (!list.length) {
    root.innerHTML = `<p class="empty" style="margin:0 var(--pad)">이 분류에는 아직 질문이 없어요.</p>`;
    return;
  }
  root.innerHTML = `<div class="rail" aria-label="FAQ"><div class="rail-track">${list
    .map((item) => {
      const caveat = item.caveatKo ? `<p class="muted">${item.caveatKo}</p>` : "";
      const tags = (item.tags || []).map((t) => `<span class="chip">${t}</span>`).join("");
      return `<article class="rail-card rail-card-wide faq-card">
        <div class="chips"><span class="chip chip-on">${CATEGORY_KO[item.category] || item.category}</span>${tags}</div>
        <details class="expand">
          <summary>${item.titleKo}</summary>
          <div class="expand-body">
            <p class="tip-q"><strong>Q.</strong> ${item.questionKo}</p>
            <p class="tip-a"><strong>A.</strong> ${item.answerKo}</p>
            ${caveat}
            ${evidenceLine(item)}
          </div>
        </details>
      </article>`;
    })
    .join("")}</div></div>`;
  initReveal();
}

async function main() {
  const mainEl = document.querySelector("main");
  try {
    const { meta, catalog, vehicleId, vehicle } = await loadSiteContext();
    bindChrome({ meta, catalog, vehicleId, pageTitle: vehicle?.displayNameKo });
    initUx({ vehicleId });
    const tips = await tryLoadJson(`data/vehicles/${vehicleId}/tips.json`);
    state.items = tips?.items || [];
    const note = document.querySelector("[data-source-note]");
    if (note) note.textContent = tips?.sourceNoteKo || "옆으로 넘겨 핵심만 훑어 보세요.";
    const hl = document.querySelector("[data-highlights]");
    if (hl) {
      hl.innerHTML = tips?.highlights?.length
        ? tips.highlights
            .map(
              (h, i) =>
                `<article class="rail-card"><span class="rail-card-kicker">포인트 ${i + 1}</span><p class="rail-card-meta" style="margin:0;color:var(--ink);font-size:0.98rem;line-height:1.45">${h}</p></article>`
            )
            .join("")
        : "";
    }
    const hlStory = document.querySelector("[data-highlights-story]");
    if (hlStory && !tips?.highlights?.length) hlStory.hidden = true;
    renderFilters();
    renderCards();
  } catch (err) {
    showError(mainEl, err);
  }
}

main();
