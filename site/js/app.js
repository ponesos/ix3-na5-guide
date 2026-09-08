/** @typedef {{ eurKrw: number, gbpKrw: number, asOf: string, eurKrwAsOf?: string, gbpKrwAsOf?: string, source: string }} Fx */

export const CATEGORY_KO = {
  interior: "실내",
  cargo: "적재",
  charging: "충전",
  wheels: "휠",
  exterior: "외장",
  other: "기타",
};

export async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`${path}를 불러오지 못했습니다 (${res.status})`);
  }
  return res.json();
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
  return `${amount} ${currency}`;
}

/**
 * @param {number} amount
 * @param {string} currency
 * @param {Fx} fx
 */
export function estimateKrw(amount, currency, fx) {
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

export function showError(el, err) {
  el.innerHTML = `<p class="error">${err.message}</p>`;
}

export function bindHeader(meta) {
  const dateEl = document.querySelector("[data-updated]");
  if (dateEl && meta.updatedAt) {
    dateEl.textContent = `데이터 ${meta.updatedAt}`;
  }
  document.title = document.title.replace(/^.*?·/, `${meta.siteName} ·`);
}
