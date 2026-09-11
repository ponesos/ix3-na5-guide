import {
  formatTrimPrice,
  formatPriceBand,
  loadJson,
  showError,
  loadSiteContext,
  bindChrome,
} from "./app.js";

function rangeText(range) {
  if (!range?.koreaCertifiedKm) return "—";
  if (range.koreaCertifiedKmMin && range.koreaCertifiedKm) {
    return `${range.koreaCertifiedKmMin.toLocaleString("ko-KR")}–${range.koreaCertifiedKm.toLocaleString("ko-KR")} km`;
  }
  return `${range.koreaCertifiedKm.toLocaleString("ko-KR")} km`;
}

function trimHighlights(trim) {
  if (!trim.highlightsKo?.length) return trim.notesKo || "—";
  const head = trim.highlightsKo.slice(0, 3).join(" · ");
  return trim.notesKo ? `${head}. ${trim.notesKo}` : head;
}

function trimNames(trims) {
  return (trims || []).map((t) => t.nameKo).filter(Boolean).join(" / ") || "—";
}

async function main() {
  const mainEl = document.querySelector("main");
  const stats = document.querySelector("[data-stats]");
  const trims = document.querySelector("[data-trims]");
  const specs = document.querySelector("[data-specs]");
  const sources = document.querySelector("[data-sources]");
  try {
    const { meta, catalog, vehicleId, vehicle: catalogItem } = await loadSiteContext();
    const vehicle = await loadJson(`data/vehicles/${vehicleId}/vehicle.json`);
    bindChrome({
      meta,
      catalog,
      vehicleId,
      pageTitle: vehicle.displayNameKo || catalogItem?.displayNameKo,
    });

    const kr = vehicle.markets?.kr;
    if (!kr) {
      throw new Error("국내(kr) 시장 데이터가 없어요.");
    }

    const kicker = document.querySelector("[data-hero-kicker]");
    const title = document.querySelector("[data-hero-title]");
    const lead = document.querySelector("[data-hero-lead]");
    if (kicker) {
      const bits = [
        vehicle.displayNameEn || vehicle.displayNameKo,
        vehicle.codeName,
        kr.powertrain,
      ].filter(Boolean);
      kicker.textContent = bits.join(" · ");
    }
    if (title) title.textContent = vehicle.displayNameKo || catalogItem?.displayNameKo || "모델 정보";
    if (lead) {
      lead.textContent =
        vehicle.heroLeadKo ||
        "국내 제원·트림·가격을 한곳에 모아 두었어요.";
    }

    stats.innerHTML = `
      <div class="stat"><dt>가격대</dt><dd>${formatPriceBand(kr.trims)}</dd></div>
      <div class="stat"><dt>주행 가능 거리</dt><dd>${rangeText(kr.range)}</dd></div>
      <div class="stat"><dt>주행 가능 거리 (WLTP)</dt><dd>${
        kr.range?.wltpKm ? `${kr.range.wltpKm.toLocaleString("ko-KR")} km` : "—"
      }</dd></div>
      <div class="stat"><dt>가속력 (0–100 km/h)</dt><dd>${
        kr.performance?.accel0to100Sec != null ? `${kr.performance.accel0to100Sec}초` : "—"
      }</dd></div>
    `;

    const pt = kr.powertrain || "파워트레인";
    trims.innerHTML = `<h2>트림</h2>
      <p class="muted"><strong>${pt}</strong> 공통 사양이에요. 트림은 ${trimNames(kr.trims)}예요.</p>
      <p class="muted">${kr.priceDisclaimerKo || ""}</p>
      <div class="table-wrap">
      <table class="trim-table">
        <thead><tr><th>트림</th><th>가격</th><th>하이라이트</th><th>휠</th></tr></thead>
        <tbody>
          ${(kr.trims || [])
            .map(
              (t) =>
                `<tr><td><strong>${t.nameKo}</strong>${
                  t.nameOfficialKo ? `<br /><span class="muted">${t.nameOfficialKo}</span>` : ""
                }</td><td>${formatTrimPrice(t)}</td><td>${trimHighlights(t)}</td><td>${t.wheelKo || "—"}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
      </div>
      <p class="muted" style="margin-top:0.85rem">최대 출력 ${kr.performance?.systemKw || "—"} kW (${
        kr.performance?.systemHp ?? "—"
      }마력) · 토크 ${kr.performance?.torqueNm || "—"} Nm (${
        kr.performance?.torqueKgm ?? "—"
      } kg·m) · 안전 최고 속도 ${kr.performance?.topSpeedKmh || "—"} km/h · Cd ${
        kr.performance?.dragCd ?? "—"
      } · ${kr.charging?.architectureV || "—"}V · DC ${kr.charging?.dcKwMin || "—"}–${
        kr.charging?.dcKwMax || "—"
      } kW</p>
      <p class="muted">${kr.charging?.notesKo || ""}</p>
      <p class="muted">${vehicle.notesKo || ""}</p>`;

    if (specs && kr.dimensionsMm) {
      const d = kr.dimensionsMm;
      const w = kr.weightKg || {};
      const b = kr.battery || {};
      const c = kr.cargo || {};
      specs.innerHTML = `<h2>주요 제원</h2>
        <table>
          <tbody>
            <tr><th>전장×전폭×전고</th><td>${d.length} × ${d.width} × ${d.height} mm</td></tr>
            <tr><th>휠베이스</th><td>${d.wheelbase} mm</td></tr>
            <tr><th>공차 / 총중량</th><td>${w.curb?.toLocaleString("ko-KR") || "—"} / ${
              w.gross?.toLocaleString("ko-KR") || "—"
            } kg</td></tr>
            <tr><th>배터리(gross)</th><td>${b.grossKwh || "—"} kWh${
              b.chemistryNoteKo ? ` · ${b.chemistryNoteKo}` : ""
            }</td></tr>
            <tr><th>복합 전비</th><td>${b.efficiencyKmPerKwhMin || "—"}–${
              b.efficiencyKmPerKwhMax || "—"
            } km/kWh</td></tr>
            <tr><th>트렁크 / 프렁크</th><td>${c.trunkLMin || "—"}–${c.trunkLMax || "—"} L / ${
              c.frunkL || "—"
            } L</td></tr>
            <tr><th>차징</th><td>AC ${kr.charging?.acKw || "—"} kW · DC 10→80% 약 ${
              kr.charging?.dc10to80Minutes || "—"
            }분 · 양방향 충전 ${kr.charging?.bidirectional ? "지원" : "—"}</td></tr>
          </tbody>
        </table>`;
    } else if (specs) {
      specs.innerHTML = "";
    }

    sources.innerHTML = `<h2>출처</h2><p class="muted">숫자와 제원은 아래를 참고했어요.</p><ul class="sources">${(
      vehicle.sources || []
    )
      .map((s) => {
        const note = s.noteKo ? ` — ${s.noteKo}` : "";
        if (s.url) {
          return `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title}</a> (${s.asOf})${note}</li>`;
        }
        return `<li>${s.title} (${s.asOf})${note}</li>`;
      })
      .join("")}</ul>`;
  } catch (err) {
    showError(mainEl, err);
  }
}

main();
