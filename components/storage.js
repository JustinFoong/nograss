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
  // Simple cumulative steps: x-axis is index, y is completed count
  let completed = 0;
  const points = [];
  allRegions.forEach((r, index) => {
    const { status } = loadRegion(r.region);
    if (status === "Complete") completed += 1;
    points.push({ step: index + 1, value: completed });
  });
  return points;
}

