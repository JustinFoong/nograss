"use client";

import { useEffect, useState } from "react";
import { STATUSES } from "./regionsData";
import { loadRegion, saveRegion } from "./storage";

export default function RegionDetail({ item }) {
  const regionId = item?.id ?? "";
  const [status, setStatus] = useState("Not started");
  const [notes, setNotes] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (!regionId) return;
    // Reset to defaults when switching regions, then load saved data if any
    setHasHydrated(false);
    setStatus("Not started");
    setNotes("");
    setYoutubeUrl("");
    const saved = loadRegion(regionId);
    if (saved.status) setStatus(saved.status);
    if (saved.notes) setNotes(saved.notes);
    if (saved.youtubeUrl) setYoutubeUrl(saved.youtubeUrl);
    // Mark as hydrated on next tick to avoid saving defaults
    Promise.resolve().then(() => setHasHydrated(true));
  }, [regionId]);

  useEffect(() => {
    if (!hasHydrated || !regionId) return;
    saveRegion(regionId, { status, notes, youtubeUrl });
  }, [regionId, status, notes, youtubeUrl, hasHydrated]);

  const youtubeId = extractYouTubeId(youtubeUrl);

  if (!item) {
    return (
      <div className="p-6 max-w-3xl mx-auto w-full card">
        <h1 className="text-xl font-semibold">Entry not found</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This region or oculus entry is not configured. Please choose another item.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto w-full card">
      <h1 className="text-2xl font-bold">{item.title}</h1>
      {item.subtitle ? (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.subtitle}</p>
      ) : null}
      <div className="h-px bg-gray-200 dark:bg-gray-700 my-4" />

      <label className="block mb-1 font-semibold">Status</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="input mb-4 w-full"
      >
        {STATUSES.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      <label className="block mb-1 font-semibold">YouTube walkthrough URL</label>
      <input
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        placeholder="https://www.youtube.com/watch?v=..."
        className="w-full input mb-3"
      />

      <div className="mb-4">
        <div className="aspect-video w-full bg-black/5 border">
          {youtubeId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="YouTube walkthrough"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Enter a YouTube URL to preview
            </div>
          )}
        </div>
      </div>

      <label className="block mb-1 font-semibold">Notes</label>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Write your notes here..."
        className="w-full h-32 input mb-4"
      />
    </div>
  );
}

function extractYouTubeId(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1);
    }
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const match = u.pathname.match(/\/embed\/([\w-]+)/);
    return match ? match[1] : "";
  } catch {
    return "";
  }
}

