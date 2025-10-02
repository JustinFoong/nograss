"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { nations } from "../components/regionsData";
import { aggregateCompletionProgress, aggregateStatusCounts } from "../components/storage";
import RegionDetail from "../components/RegionDetail";

const COLORS = ["#4ade80", "#facc15", "#f87171"];

export default function Home() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");

  useEffect(() => {
    setPieData(aggregateStatusCounts());
    setLineData(aggregateCompletionProgress());
    const onStorage = () => {
      setPieData(aggregateStatusCounts());
      setLineData(aggregateCompletionProgress());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
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
              <h2 className="font-bold mb-2">Progress Graph</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="w-1/2 card">
              <h2 className="font-bold mb-2">Status Overview</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
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

