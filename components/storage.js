import { STATUSES, allRegions } from "./regionsData";

const STORAGE_PREFIX = "genshin-region:";

export function getRegionKey(regionName) {
  return `${STORAGE_PREFIX}${regionName}`;
}

export function loadRegion(regionName) {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(getRegionKey(regionName));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRegion(regionName, data) {
  if (typeof window === "undefined") return;
  const toSave = { ...data };
  try {
    localStorage.setItem(getRegionKey(regionName), JSON.stringify(toSave));
    // Notify same-tab listeners to refresh aggregates
    try {
      window.dispatchEvent(new Event("region-updated"));
    } catch {}
  } catch {
    // ignore
  }
}

export function aggregateStatusCounts() {
  if (typeof window === "undefined") return [];
  const counts = { "Complete": 0, "Working on it": 0, "Not started": 0 };
  for (const { region } of allRegions) {
    const { status } = loadRegion(region);
    const normalized = STATUSES.includes(status) ? status : "Not started";
    counts[normalized] += 1;
  }
  return [
    { name: "Complete", value: counts["Complete"] },
    { name: "Working on it", value: counts["Working on it"] },
    { name: "Not started", value: counts["Not started"] },
  ];
}

export function aggregateCompletionProgress() {
  if (typeof window === "undefined") return [];
  // Build cumulative completion counts by completionDate (YYYY-MM-DD)
  const completions = [];
  for (const { region } of allRegions) {
    const { status, completionDate } = loadRegion(region);
    if (status === "Complete" && completionDate) {
      // normalize date to YYYY-MM-DD
      const d = new Date(completionDate);
      if (!isNaN(d)) {
        const key = d.toISOString().slice(0, 10);
        completions.push(key);
      }
    }
  }
  if (completions.length === 0) return [];
  // Count per date
  const perDate = completions.reduce((acc, key) => {
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  // Sort dates and build cumulative series
  const dates = Object.keys(perDate).sort();
  let running = 0;
  const series = dates.map((date) => {
    running += perDate[date];
    return { date, value: running };
  });
  return series;
}

