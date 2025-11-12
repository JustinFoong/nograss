import { STATUSES, regionEntries, oculiEntries } from "./regionsData";

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
  for (const { id } of regionEntries) {
    const { status } = loadRegion(id);
    const normalized = STATUSES.includes(status) ? status : "Not started";
    counts[normalized] += 1;
  }
  return [
    { name: "Complete", value: counts["Complete"] },
    { name: "Working on it", value: counts["Working on it"] },
    { name: "Not started", value: counts["Not started"] },
  ];
}

export function aggregateOculiStatusCounts() {
  if (typeof window === "undefined") return [];
  const counts = { "Complete": 0, "Working on it": 0, "Not started": 0 };
  for (const { id } of oculiEntries) {
    const { status } = loadRegion(id);
    const normalized = STATUSES.includes(status) ? status : "Not started";
    counts[normalized] += 1;
  }
  return [
    { name: "Complete", value: counts["Complete"] },
    { name: "Working on it", value: counts["Working on it"] },
    { name: "Not started", value: counts["Not started"] },
  ];
}

