"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { nations } from "../components/regionsData";
import { aggregateCompletionProgress, aggregateStatusCounts } from "../components/storage";
import RegionDetail from "../components/RegionDetail";

// Fixed color mapping by status name order: Complete (green), Working (yellow), Not started (red)
const STATUS_COLORS = {
  "Complete": "#4ade80",
  "Working on it": "#facc15",
  "Not started": "#f87171",
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const dd = String(d.getDate()).padStart(2, "0");
    const mon = d.toLocaleString("en-US", { month: "short" });
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}-${mon}-${yy}`;
  };

  useEffect(() => {
    const refresh = () => {
      setPieData(aggregateStatusCounts());
      setLineData(aggregateCompletionProgress());
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("region-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("region-updated", refresh);
    };
  }, []);

  const filteredNations = useMemo(() => {
    const q = search.toLowerCase();
    const result = {};
    Object.keys(nations).forEach((nation) => {
      const nationMatches = nation.toLowerCase().includes(q);
      if (nationMatches) {
        result[nation] = nations[nation];
      } else {
        const regions = nations[nation].filter((region) => region.toLowerCase().includes(q));
        if (regions.length) result[nation] = regions;
      }
    });
    return result;
  }, [search]);

  const visiblePieData = useMemo(() => pieData.filter((d) => d.value > 0), [pieData]);
  const legendData = useMemo(() => pieData.map((d) => ({ ...d, color: STATUS_COLORS[d.name] })), [pieData]);

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <div className="w-1/4 border-r p-4 overflow-y-auto dark:border-gray-800">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 input"
        />
        {Object.keys(filteredNations).map((nation) => (
          <div key={nation} className="mb-2">
            <button
              onClick={() => setExpanded((prev) => ({ ...prev, [nation]: !prev[nation] }))}
              className="flex w-full items-center justify-between font-bold"
            >
              <span>{nation}</span>
              <span>{expanded[nation] ? "−" : "+"}</span>
            </button>
            <div className={`${expanded[nation] ? "block" : "hidden"} mt-1`}> 
              {filteredNations[nation].map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${selectedRegion === region ? "bg-blue-50" : ""}`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 p-4 flex gap-8">
        {selectedRegion ? (
          <div className="w-full">
            <div className="mb-3">
              <button className="text-blue-600 hover:underline" onClick={() => setSelectedRegion("")}>← Back to Home</button>
            </div>
            <RegionDetail regionName={selectedRegion} />
          </div>
        ) : (
          <>
            <div className="w-1/2 card">
              <h2 className="font-bold mb-2">Progress Over Time</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => formatDate(d)}
                      axisLine={{ stroke: "#e5e7eb", strokeDasharray: "3 3" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={{ stroke: "#e5e7eb", strokeDasharray: "3 3" }}
                      tickLine={false}
                    />
                    <Tooltip labelFormatter={(d) => `Date: ${formatDate(d)}`} formatter={(v) => [v, "Completed"]} />
                    <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="w-1/2 card">
              <h2 className="font-bold mb-2">Status Overview</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={visiblePieData} dataKey="value" nameKey="name" outerRadius={95} label>
                      {visiblePieData.map((entry, i) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Legend
                      payload={legendData.map((d) => ({ value: d.name, type: "circle", color: STATUS_COLORS[d.name] }))}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

