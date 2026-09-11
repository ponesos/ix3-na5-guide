import {
  CATEGORY_KO,
  estimateKrw,
  formatKrw,
  formatMoney,
  tryLoadJson,
  showError,
  loadSiteContext,
  bindChrome,
} from "./app.js";

const ORIGIN_KO = {
  oem: "정품",
  thirdParty: "서드파티",
};

const state = {
  items: [],
  fx: null,
  origin: "all",
  category: "all",
  market: "all",
};

function marketLabel(code) {
  if (code === "DE") return "독일";
  if (code === "UK") return "영국";
  if (code === "NL") return "네덜란드";
  if (code === "KR") return "한국";
  if (code === "EB") return "eBay";
  return code;
}

function linkLabel(m) {
  if (m.country === "EB" || m.channelKo === "eBay") return "eBay에서 보기";
  if (m.channelKo) return `${m.channelKo}에서 보기`;
  if (m.country === "KR") return "한국에서 보기";
  if (m.country === "NL") return `${marketLabel(m.country)} 페이지 보기`;
  return `${marketLabel(m.country)} 공식 페이지`;
}

function renderFilters(items) {
  const origins = ["all", ...new Set(items.map((i) => i.origin || "oem"))];
  const cats = ["all", ...new Set(items.map((i) => i.category))];
  const markets = ["all", ...new Set(items.flatMap((i) => i.markets.map((m) => m.country)))];

  const originBox = document.querySelector("[data-filter-origin]");
  const catBox = document.querySelector("[data-filter-category]");
  const mktBox = document.querySelector("[data-filter-market]");

  originBox.innerHTML =
    `<span>출처</span>` +
    origins
      .map((o) => {
        const label = o === "all" ? "전체" : ORIGIN_KO[o] || o;
        return `<button type="button" data-origin="${o}" aria-pressed="${state.origin === o}">${label}</button>`;
      })
      .join("");

  catBox.innerHTML =
    `<span>분류</span>` +
    cats
      .map((c) => {
        const label = c === "all" ? "전체" : CATEGORY_KO[c] || c;
        return `<button type="button" data-cat="${c}" aria-pressed="${state.category === c}">${label}</button>`;
      })
      .join("");

  mktBox.innerHTML =
    `<span>시장</span>` +
    markets
      .map((c) => {
        const label = c === "all" ? "전체" : marketLabel(c);
        return `<button type="button" data-mkt="${c}" aria-pressed="${state.market === c}">${label}</button>`;
      })
      .join("");

  originBox.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.origin = btn.getAttribute("data-origin");
      renderFilters(items);
      renderCards();
    });
  });
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
    const origin = item.origin || "oem";
    if (state.origin !== "all" && origin !== state.origin) return false;
    if (state.category !== "all" && item.category !== state.category) return false;
    if (state.market !== "all" && !item.markets.some((m) => m.country === state.market)) return false;
    return true;
  });
}

function renderCards() {
  const root = document.querySelector("[data-cards]");
  const list = filtered();
  const count = document.querySelector("[data-count]");
  if (count) count.textContent = `${list.length}개`;
  if (!list.length) {
    root.innerHTML = `<p class="empty">조건에 맞는 액세서리가 없어요. 필터를 조금 풀어 볼까요?</p>`;
    return;
  }

  root.innerHTML = list
    .map((item, idx) => {
      const origin = item.origin || "oem";
      const chips = [
        `<span class="chip ${origin === "oem" ? "chip-on" : ""}">${ORIGIN_KO[origin] || origin}</span>`,
        `<span class="chip">${CATEGORY_KO[item.category] || item.category}</span>`,
        item.na5Dedicated
          ? `<span class="chip chip-on">NA5 전용</span>`
          : `<span class="chip">공용·적합성 확인</span>`,
      ].join("");

      const primary = item.markets[0];
      const est = primary ? estimateKrw(primary.price, primary.currency, state.fx) : null;
      const isKrw = primary?.currency === "KRW";
      const priceBlock = primary
        ? `<p class="price">
            <span class="price-krw">${
              est == null
                ? formatMoney(primary.price, primary.currency)
                : isKrw
                  ? formatMoney(primary.price, "KRW")
                  : `약 ${formatKrw(est)}`
            }</span>
            ${
              isKrw
                ? `<span class="price-local">${marketLabel(primary.country)}${
                    primary.channelKo ? ` · ${primary.channelKo}` : ""
                  }</span>`
                : `<span class="price-local">${marketLabel(primary.country)} ${formatMoney(
                    primary.price,
                    primary.currency
                  )}${
                    typeof primary.listPrice === "number"
                      ? ` · 정가 ${formatMoney(primary.listPrice, primary.currency)}`
                      : ""
                  }</span>`
            }
            <span class="muted">${isKrw ? "표시가" : "추정 환율"} · ${primary.asOf}${
              primary.promoUntil ? ` · 프로모 ~${primary.promoUntil}` : ""
            }</span>
            ${
              primary.priceNoteKo
                ? `<span class="muted">${primary.priceNoteKo}</span>`
                : ""
            }
          </p>`
        : "";

      const links = item.markets
        .map(
          (m) =>
            `<a class="btn" href="${m.sourceUrl}" target="_blank" rel="noopener noreferrer">${linkLabel(m)}</a>`
        )
        .join("");

      const extraMarkets =
        item.markets.length > 1
          ? item.markets
              .slice(1)
              .map((m) => {
                const e = estimateKrw(m.price, m.currency, state.fx);
                return `<p class="muted">${marketLabel(m.country)} ${formatMoney(
                  m.price,
                  m.currency
                )}${m.currency !== "KRW" && e != null ? ` · 약 ${formatKrw(e)}` : ""} · ${m.asOf}</p>`;
              })
              .join("")
          : "";

      const partRow = item.oemPartNumber
        ? `<div class="part-row">
            <span>부품번호</span>
            <span class="part">${item.oemPartNumber}</span>
            <button type="button" class="btn-copy" data-copy="${item.oemPartNumber}">복사</button>
          </div>`
        : item.brandKo
          ? `<p class="orig">브랜드 · ${item.brandKo}${item.sellerSku ? ` · ${item.sellerSku}` : ""}</p>`
          : "";

      const notes = item.fitmentNotes ? `<p class="muted">${item.fitmentNotes}</p>` : "";
      const disc = item.disclaimer ? `<p class="muted">${item.disclaimer}</p>` : "";
      const origLine =
        origin === "thirdParty" && item.brandKo
          ? `<p class="orig">${item.brandKo}${item.titleOriginal && item.titleOriginal !== item.titleKo ? ` · ${item.titleOriginal}` : ""}</p>`
          : `<p class="orig">${item.titleOriginal}</p>`;

      return `<article class="item item-acc" style="animation-delay:${Math.min(idx, 8) * 0.04}s">
        <div class="item-body">
          <div class="chips">${chips}</div>
          <h2>${item.titleKo}</h2>
          ${origLine}
          ${partRow}
          <p class="summary">${item.summaryKo}</p>
          ${notes}
          ${disc}
          ${extraMarkets}
        </div>
        <div class="item-side">
          ${priceBlock}
          ${links}
        </div>
      </article>`;
    })
    .join("");

  root.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.getAttribute("data-copy");
      try {
        await navigator.clipboard.writeText(value);
        btn.textContent = "복사됨";
        setTimeout(() => {
          btn.textContent = "복사";
        }, 1400);
      } catch {
        btn.textContent = "실패";
      }
    });
  });
}

async function main() {
  const mainEl = document.querySelector("main");
  try {
    const { meta, catalog, vehicleId, vehicle } = await loadSiteContext();
    bindChrome({ meta, catalog, vehicleId, pageTitle: vehicle?.displayNameKo });
    const accessories = await tryLoadJson(`data/vehicles/${vehicleId}/accessories.json`);
    state.fx = meta.fx;
    state.items = accessories?.items || [];
    const note = document.querySelector("[data-source-note]");
    if (note) {
      note.textContent = accessories?.sourceNoteKo || (state.items.length ? "" : "이 차종의 액세서리는 아직 준비 중이에요.");
    }
    const fxNote = document.querySelector("[data-fx]");
    if (fxNote) {
      fxNote.textContent = `해외가 추정 원화는 ${meta.fx.asOf} 스냅샷이에요. EUR ${meta.fx.eurKrw.toLocaleString("ko-KR")}원/€, GBP ${meta.fx.gbpKrw.toLocaleString("ko-KR")}원/£. 한국(KRW) 표시가는 환산하지 않아요. ${meta.fx.source}`;
    }
    renderFilters(state.items);
    renderCards();
  } catch (err) {
    showError(mainEl, err);
  }
}

main();
