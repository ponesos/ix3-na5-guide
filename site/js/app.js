/** @typedef {{ eurKrw: number, gbpKrw: number, asOf: string, eurKrwAsOf?: string, gbpKrwAsOf?: string, source: string }} Fx */
/** @typedef {{ id: string, displayNameKo: string, codeName?: string, blurbKo?: string, status: string }} VehicleCatalogItem */
/** @typedef {{ updatedAt: string, defaultVehicleId: string, items: VehicleCatalogItem[] }} VehiclesCatalog */

export const CATEGORY_KO = {
  interior: "인테리어",
  cargo: "적재",
  charging: "차징",
  wheels: "휠",
  exterior: "익스테리어",
  other: "기타",
};

const NAV_ITEMS = [
  { page: "vehicles.html", label: "차종", hub: true },
  { page: "index.html", label: "모델 정보" },
  { page: "accessories.html", label: "액세서리" },
  { page: "tips.html", label: "FAQ" },
  { page: "compare.html", label: "비교" },
  { page: "reviews.html", label: "시승기" },
  { page: "news.html", label: "뉴스" },
  { page: "community.html", label: "커뮤니티" },
];

export async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`${path}를 불러오지 못했어요 (${res.status})`);
  }
  return res.json();
}

/** @returns {Promise<object|null>} */
export async function tryLoadJson(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function currentPageName() {
  const path = window.location.pathname.replace(/\/+$/, "");
  const base = path.split("/").pop() || "index.html";
  return base.includes(".") ? base : "index.html";
}

/**
 * @param {VehiclesCatalog} [catalog]
 */
export function getVehicleId(catalog) {
  const fromUrl = new URLSearchParams(window.location.search).get("v");
  if (fromUrl) return fromUrl;
  return catalog?.defaultVehicleId || "";
}

/**
 * @param {string} page
 * @param {string} [vehicleId]
 */
export function vehicleHref(page, vehicleId) {
  const id = vehicleId ?? getVehicleId();
  if (!id || page === "vehicles.html") return page;
  return `${page}?v=${encodeURIComponent(id)}`;
}

/**
 * @param {VehiclesCatalog} catalog
 * @param {string} vehicleId
 */
export function findVehicle(catalog, vehicleId) {
  return catalog.items.find((v) => v.id === vehicleId) || null;
}

/**
 * Resolve vehicle id for section pages. Invalid id falls back to default.
 * @param {VehiclesCatalog} catalog
 */
export function resolveVehicleId(catalog) {
  const raw = getVehicleId(catalog);
  if (findVehicle(catalog, raw)) return raw;
  return catalog.defaultVehicleId;
}

export function formatKrw(n) {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

export function formatMoney(amount, currency) {
  if (currency === "EUR") {
    return `${amount.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
  }
  if (currency === "GBP") {
    return `£${amount.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  }
  if (currency === "KRW") {
    return `${Math.round(amount).toLocaleString("ko-KR")}원`;
  }
  return `${amount} ${currency}`;
}

/**
 * @param {number} amount
 * @param {string} currency
 * @param {Fx} fx
 */
export function estimateKrw(amount, currency, fx) {
  if (currency === "KRW") return amount;
  if (currency === "EUR") return amount * fx.eurKrw;
  if (currency === "GBP") return amount * fx.gbpKrw;
  return null;
}

export function formatTrimPrice(trim) {
  if (typeof trim.priceKrw === "number") {
    return formatKrw(trim.priceKrw);
  }
  if (trim.priceKrwMin && trim.priceKrwMax) {
    return `${formatKrw(trim.priceKrwMin)} – ${formatKrw(trim.priceKrwMax)}`;
  }
  return "미정";
}

/** Lowest/highest KRW across trims (uses priceKrw or min/max). */
export function trimPriceBounds(trims) {
  const values = [];
  for (const t of trims || []) {
    if (typeof t.priceKrw === "number") values.push(t.priceKrw);
    if (typeof t.priceKrwMin === "number") values.push(t.priceKrwMin);
    if (typeof t.priceKrwMax === "number") values.push(t.priceKrwMax);
  }
  if (!values.length) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
}

export function formatPriceBand(trims) {
  const b = trimPriceBounds(trims);
  if (!b) return "미정";
  if (b.min === b.max) return formatKrw(b.min);
  return `${formatKrw(b.min)}–${formatKrw(b.max)}`;
}

export function showError(el, err) {
  el.innerHTML = `<p class="error">${err.message}</p>`;
}

/**
 * @param {{
 *   meta: object,
 *   catalog?: VehiclesCatalog,
 *   vehicleId?: string,
 *   pageTitle?: string,
 *   isHub?: boolean
 * }} opts
 */
export function bindChrome(opts) {
  const { meta, catalog, vehicleId, pageTitle, isHub } = opts;
  const current = currentPageName();
  const vid = vehicleId || (catalog ? resolveVehicleId(catalog) : "");
  const vehicle = catalog && vid ? findVehicle(catalog, vid) : null;

  const dateEl = document.querySelector("[data-updated]");
  if (dateEl && meta.updatedAt) {
    dateEl.textContent = `${meta.updatedAt} 기준`;
  }

  const notice = document.querySelector("[data-notice]");
  if (notice) {
    notice.textContent =
      meta.purposeKo ||
      "수입 전기차 제원·가격·FAQ·액세서리를 한곳에서 빠르게 살펴보는 노트예요.";
  }

  const brand = document.querySelector(".brand");
  if (brand && meta.siteName) {
    brand.innerHTML = `${meta.siteName} <span class="tag">비공식</span>`;
    brand.setAttribute("href", vehicleHref("index.html", vid));
  }

  const nav = document.querySelector(".nav ul");
  if (nav) {
    nav.innerHTML = NAV_ITEMS.map((item) => {
      const href = item.hub ? "vehicles.html" : vehicleHref(item.page, vid);
      const isCurrent = current === item.page;
      return `<li><a href="${href}"${isCurrent ? ' aria-current="page"' : ""}>${item.label}</a></li>`;
    }).join("");
  }

  const switcher = document.querySelector("[data-vehicle-switcher]");
  if (switcher && catalog) {
    if (isHub || catalog.items.length < 2) {
      if (vehicle && !isHub) {
        switcher.innerHTML = `<p class="vehicle-pill"><span class="vehicle-pill-label">보는 차</span> <strong>${vehicle.displayNameKo}</strong>${
          vehicle.codeName ? ` <span class="muted">· ${vehicle.codeName}</span>` : ""
        }</p>`;
      } else {
        switcher.innerHTML = "";
      }
    } else {
      const options = catalog.items
        .map(
          (v) =>
            `<option value="${v.id}"${v.id === vid ? " selected" : ""}>${v.displayNameKo}${
              v.codeName ? ` (${v.codeName})` : ""
            }</option>`
        )
        .join("");
      switcher.innerHTML = `<label class="vehicle-switch"><span class="vehicle-pill-label">차종</span>
        <select data-vehicle-select aria-label="차종 선택">${options}</select></label>`;
      switcher.querySelector("[data-vehicle-select]")?.addEventListener("change", (e) => {
        const next = e.target.value;
        const page = isHub ? "index.html" : currentPageName();
        const target = page === "vehicles.html" ? "index.html" : page;
        window.location.href = vehicleHref(target, next);
      });
    }
  }

  const titleBit = pageTitle || vehicle?.displayNameKo || meta.siteName;
  const section =
    NAV_ITEMS.find((n) => n.page === current)?.label ||
    (isHub ? "차종" : document.title.split("·").pop()?.trim() || "");
  document.title = `${titleBit} · ${section}`;
}

/**
 * Load meta + vehicles catalog and resolve current vehicle id for section pages.
 */
export async function loadSiteContext() {
  const [meta, catalog] = await Promise.all([
    loadJson("data/meta.json"),
    loadJson("data/vehicles.json"),
  ]);
  const vehicleId = resolveVehicleId(catalog);
  return { meta, catalog, vehicleId, vehicle: findVehicle(catalog, vehicleId) };
}
