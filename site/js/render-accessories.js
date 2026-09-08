import {
  CATEGORY_KO,
  estimateKrw,
  formatKrw,
  formatMoney,
  loadJson,
  showError,
  bindHeader,
} from "./app.js";

const VEHICLE_ID = "na5-ix3";

const state = {
  items: [],
  fx: null,
  category: "all",
  market: "all",
};

function marketLabel(code) {
  if (code === "DE") return "독일";
  if (code === "UK") return "영국";
  if (code === "NL") return "네덜란드";
  return code;
}

function renderFilters(items) {
  const cats = ["all", ...new Set(items.map((i) => i.category))];
  const markets = ["all", ...new Set(items.flatMap((i) => i.markets.map((m) => m.country)))];

  const catBox = document.querySelector("[data-filter-category]");
  const mktBox = document.querySelector("[data-filter-market]");

  catBox.innerHTML = `<span>분류</span>` + cats.map((c) => {
    const label = c === "all" ? "전체" : CATEGORY_KO[c] || c;
    const pressed = state.category === c;
    return `<button type="button" data-cat="${c}" aria-pressed="${pressed}">${label}</button>`;
  }).join("");

  mktBox.innerHTML = `<span>시장</span>` + markets.map((c) => {
    const label = c === "all" ? "전체" : marketLabel(c);
    const pressed = state.market === c;
    return `<button type="button" data-mkt="${c}" aria-pressed="${pressed}">${label}</button>`;
  }).join("");

  catBox.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.category = btn.getAttribute("data-cat");
      renderFilters(items);
      renderCards();
    });
  });
  mktBox.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.market = btn.getAttribute("data-mkt");
      renderFilters(items);
      renderCards();
    });
  });
}

function filtered() {
  return state.items.filter((item) => {
    if (state.category !== "all" && item.category !== state.category) return false;
    if (state.market !== "all" && !item.markets.some((m) => m.country === state.market)) return false;
    return true;
  });
}

function renderCards() {
  const root = document.querySelector("[data-cards]");
  const list = filtered();
  const count = document.querySelector("[data-count]");
  if (count) {
    count.textContent = `${list.length}개`;
  }
  if (!list.length) {
    root.innerHTML = `<p class="empty">조건에 맞는 항목이 없습니다. Phase 1에서 카탈로그를 늘립니다.</p>`;
    return;
  }

  root.innerHTML = list
    .map((item) => {
      const chips = [
        `<span class="chip">${CATEGORY_KO[item.category] || item.category}</span>`,
        item.na5Dedicated
          ? `<span class="chip">NA5 전용</span>`
          : `<span class="chip">공용·VIN 확인</span>`,
      ].join("");

      const markets = item.markets
        .map((m) => {
          const est = estimateKrw(m.price, m.currency, state.fx);
          const estBlock =
            est == null
              ? `<span class="price-krw">${formatMoney(m.price, m.currency)}</span>`
              : `<span class="price-krw">약 ${formatKrw(est)}</span>`;
          const localLine = `<span class="price-local">${marketLabel(m.country)} ${formatMoney(m.price, m.currency)}${
            typeof m.listPrice === "number"
              ? ` · 정가 ${formatMoney(m.listPrice, m.currency)}`
              : ""
          }</span>`;
          const promo = m.promoUntil
            ? `<br /><span class="muted">프로모 ~${m.promoUntil}</span>`
            : "";
          const pnote = m.priceNoteKo
            ? `<br /><span class="muted">${m.priceNoteKo}</span>`
            : "";
          const linkLabel =
            m.country === "NL"
              ? `시장 허브 (${marketLabel(m.country)})`
              : `공식 페이지 (${marketLabel(m.country)})`;
          return `<p class="price">${estBlock}<br />${localLine}<br /><span class="muted">추정 환율 · 표시가 기준 ${m.asOf}</span>${promo}${pnote}</p>
            <p><a href="${m.sourceUrl}" target="_blank" rel="noopener noreferrer">${linkLabel}</a></p>`;
        })
        .join("");

      const notes = item.fitmentNotes
        ? `<p class="muted">${item.fitmentNotes}</p>`
        : "";
      const disc = item.disclaimer ? `<p class="muted">${item.disclaimer}</p>` : "";

      let media;
      if (item.image?.src) {
        const credit = item.image.creditKo
          ? `<p class="card-credit">${item.image.creditKo}</p>`
          : "";
        media = `<div class="card-media"><img src="${item.image.src}" alt="${item.image.altKo || item.titleKo}" loading="lazy" width="640" height="400" />${credit}</div>`;
      } else {
        media = `<div class="card-media"><div class="card-media-empty">사진 준비 중</div></div>`;
      }

      return `<article class="card">
        ${media}
        <div>${chips}</div>
        <h2>${item.titleKo}</h2>
        <p class="orig">${item.titleOriginal}</p>
        <p>부품번호 <span class="part">${item.oemPartNumber}</span></p>
        <p>${item.summaryKo}</p>
        ${markets}
        ${notes}
        ${disc}
      </article>`;
    })
    .join("");
}

async function main() {
  const mainEl = document.querySelector("main");
  try {
    const [meta, catalog] = await Promise.all([
      loadJson("data/meta.json"),
      loadJson(`data/vehicles/${VEHICLE_ID}/accessories.json`),
    ]);
    bindHeader(meta);
    state.fx = meta.fx;
    state.items = catalog.items || [];
    const fxNote = document.querySelector("[data-fx]");
    if (fxNote) {
      fxNote.textContent = `추정 원화는 ${meta.fx.asOf} 스냅샷 환율입니다. EUR ${meta.fx.eurKrw.toLocaleString("ko-KR")}원/€ (기준 ${meta.fx.eurKrwAsOf || meta.fx.asOf}), GBP ${meta.fx.gbpKrw.toLocaleString("ko-KR")}원/£ (기준 ${meta.fx.gbpKrwAsOf || meta.fx.asOf}). ${meta.fx.source}`;
    }
    renderFilters(state.items);
    renderCards();
  } catch (err) {
    showError(mainEl, err);
  }
}

main();
