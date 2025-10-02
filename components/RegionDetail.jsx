"use client";

import { useEffect, useState } from "react";
import { STATUSES } from "./regionsData";
import { loadRegion, saveRegion } from "./storage";

export default function RegionDetail({ regionName }) {
  const [status, setStatus] = useState("Not started");
  const [notes, setNotes] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  useEffect(() => {
    const saved = loadRegion(regionName);
    if (saved.status) setStatus(saved.status);
    if (saved.notes) setNotes(saved.notes);
    if (saved.completionDate) setCompletionDate(saved.completionDate);
    if (saved.youtubeUrl) setYoutubeUrl(saved.youtubeUrl);
  }, [regionName]);

  useEffect(() => {
    saveRegion(regionName, { status, notes, completionDate, youtubeUrl });
  }, [regionName, status, notes, completionDate, youtubeUrl]);

  const youtubeId = extractYouTubeId(youtubeUrl);

  return (
    <div className="p-6 max-w-3xl mx-auto w-full card">
      <h1 className="text-2xl font-bold mb-4">{regionName}</h1>

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

      <label className="block mb-1 font-semibold">Completion Date</label>
      <input
        type="date"
        value={completionDate}
        onChange={(e) => setCompletionDate(e.target.value)}
        className="input"
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

