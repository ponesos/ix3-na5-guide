import { formatTrimPrice, loadJson, showError, bindHeader } from "./app.js";

const VEHICLE_ID = "na5-ix3";

function rangeText(range) {
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

async function main() {
  const stats = document.querySelector("[data-stats]");
  const trims = document.querySelector("[data-trims]");
  const specs = document.querySelector("[data-specs]");
  const sources = document.querySelector("[data-sources]");
  try {
    const [meta, vehicle] = await Promise.all([
      loadJson("data/meta.json"),
      loadJson(`data/vehicles/${VEHICLE_ID}/vehicle.json`),
    ]);
    bindHeader(meta);
    const kr = vehicle.markets.kr;
    const se = kr.trims.find((t) => t.id === "se");
    stats.innerHTML = `
      <div class="stat"><dt>국내 시작가</dt><dd>${formatTrimPrice(se)}</dd></div>
      <div class="stat"><dt>국내 인증 항속</dt><dd>${rangeText(kr.range)}</dd></div>
      <div class="stat"><dt>WLTP 항속</dt><dd>${kr.range.wltpKm.toLocaleString("ko-KR")} km</dd></div>
      <div class="stat"><dt>0–100 km/h</dt><dd>${kr.performance.accel0to100Sec}초</dd></div>
    `;

    trims.innerHTML = `<h2>국내 트림 · ${kr.powertrain}</h2>
      <p class="muted">${kr.priceDisclaimerKo}</p>
      <table>
        <thead><tr><th>트림</th><th>가격</th><th>휠·하이라이트</th></tr></thead>
        <tbody>
          ${kr.trims
            .map(
              (t) =>
                `<tr><td>${t.nameKo}${t.wheelKo ? `<br /><span class="muted">${t.wheelKo}</span>` : ""}</td><td>${formatTrimPrice(t)}</td><td>${trimHighlights(t)}</td></tr>`
            )
            .join("")}
        </tbody>
      </table>
      <p class="muted" style="margin-top:0.75rem">시스템 ${kr.performance.systemKw || "—"} kW (${kr.performance.systemHp}마력) · 토크 ${kr.performance.torqueNm || "—"} Nm (${kr.performance.torqueKgm} kg·m) · 최고 ${kr.performance.topSpeedKmh || "—"} km/h · Cd ${kr.performance.dragCd} · ${kr.charging.architectureV}V · DC ${kr.charging.dcKwMin}–${kr.charging.dcKwMax} kW</p>
      <p class="muted">${kr.charging.notesKo}</p>
      <p class="muted">${vehicle.notesKo}</p>`;

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
            <tr><th>공차 / 총중량</th><td>${w.curb?.toLocaleString("ko-KR") || "—"} / ${w.gross?.toLocaleString("ko-KR") || "—"} kg</td></tr>
            <tr><th>배터리(gross)</th><td>${b.grossKwh || "—"} kWh${b.chemistryNoteKo ? ` · ${b.chemistryNoteKo}` : ""}</td></tr>
            <tr><th>복합 전비</th><td>${b.efficiencyKmPerKwhMin || "—"}–${b.efficiencyKmPerKwhMax || "—"} km/kWh</td></tr>
            <tr><th>트렁크 / 프렁크</th><td>${c.trunkLMin || "—"}–${c.trunkLMax || "—"} L / ${c.frunkL || "—"} L</td></tr>
            <tr><th>충전(참고)</th><td>AC ${kr.charging.acKw || "—"} kW · DC 10→80% 약 ${kr.charging.dc10to80Minutes || "—"}분 · 양방향 ${kr.charging.bidirectional ? "지원" : "—"}</td></tr>
          </tbody>
        </table>`;
    }

    sources.innerHTML = `<h2>출처</h2><ul class="sources">${vehicle.sources
      .map((s) => {
        const note = s.noteKo ? ` — ${s.noteKo}` : "";
        if (s.url) {
          return `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title}</a> (${s.asOf})${note}</li>`;
        }
        return `<li>${s.title} (${s.asOf})${note}</li>`;
      })
      .join("")}</ul>`;
  } catch (err) {
    showError(document.querySelector("main"), err);
  }
}

main();
