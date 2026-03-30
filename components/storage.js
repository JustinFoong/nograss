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

export function exportData() {
  if (typeof window === "undefined") return;
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(STORAGE_PREFIX)) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key));
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `genshin-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file) {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Not in browser"));
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        let count = 0;
        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith(STORAGE_PREFIX)) {
            localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
            count++;
          }
        }
        window.dispatchEvent(new Event("region-updated"));
        resolve(count);
      } catch {
        reject(new Error("Invalid backup file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

