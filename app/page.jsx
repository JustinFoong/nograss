"use client";

import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { nations, getItemById } from "../components/regionsData";
import {
  aggregateCompletionProgress,
  aggregateOculiProgress,
  aggregateStatusCounts,
} from "../components/storage";
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
  const [oculiData, setOculiData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
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
      setOculiData(aggregateOculiProgress());
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
    const q = search.trim().toLowerCase();
    const result = {};
    Object.entries(nations).forEach(([nation, data]) => {
      const { regions = [], oculi = {} } = data;
      const nationMatches = nation.toLowerCase().includes(q);

      const resolvedRegions = nationMatches
        ? regions
        : regions.filter((region) => region.toLowerCase().includes(q));

      const resolvedOculi = {};
      Object.entries(oculi).forEach(([type, patches]) => {
        const typeMatches = type.toLowerCase().includes(q);
        if (nationMatches || typeMatches) {
          resolvedOculi[type] = patches;
          return;
        }
        const matches = patches.filter((patch) =>
          `${type} ${patch}`.toLowerCase().includes(q) || patch.toLowerCase().includes(q)
        );
        if (matches.length) {
          resolvedOculi[type] = matches;
        }
      });

      const hasRegions = nationMatches ? regions.length : resolvedRegions.length;
      const hasOculi = nationMatches ? Object.keys(oculi).length : Object.keys(resolvedOculi).length;
      if (nationMatches || hasRegions || hasOculi) {
        result[nation] = {
          regions: nationMatches ? regions : resolvedRegions,
          oculi: nationMatches ? oculi : resolvedOculi,
        };
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
        {Object.entries(filteredNations).map(([nation, data]) => (
          <div key={nation} className="mb-2">
            <button
              onClick={() => setExpanded((prev) => ({ ...prev, [nation]: !prev[nation] }))}
              className="flex w-full items-center justify-between font-bold"
            >
              <span>{nation}</span>
              <span>{expanded[nation] ? "−" : "+"}</span>
            </button>
            <div className={`${expanded[nation] ? "block" : "hidden"} mt-1`}>
              {data.oculi && Object.keys(data.oculi).length
                ? Object.entries(data.oculi).map(([type, patches]) => (
                    <div key={type} className="mt-3 first:mt-0">
                      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">{type}</div>
                      <div className="mt-1 space-y-1">
                        {patches.map((patch) => {
                          const id = `${type}::${patch}`;
                          const item =
                            getItemById(id) ?? {
                              id,
                              title: `${type} ${patch}`,
                              subtitle: `${nation} • ${type}`,
                            };
                          return (
                            <button
                              key={id}
                              onClick={() => setSelectedItem(item)}
                              className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                                selectedItem?.id === item.id ? "bg-blue-50 dark:bg-blue-900/40" : ""
                              }`}
                            >
                              {patch}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                : null}
              {data.regions?.length ? (
                <div className="mt-3 space-y-1">
                  {data.regions.map((region) => {
                    const item = getItemById(region) ?? {
                      id: region,
                      title: region,
                      subtitle: `${nation} • Region`,
                    };
                    return (
                      <button
                        key={region}
                        onClick={() => setSelectedItem(item)}
                        className={`block w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                          selectedItem?.id === item.id ? "bg-blue-50 dark:bg-blue-900/40" : ""
                        }`}
                      >
                        {region}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 p-4 overflow-y-auto">
        {selectedItem ? (
          <div className="w-full">
            <div className="mb-3">
              <button className="text-blue-600 hover:underline" onClick={() => setSelectedItem(null)}>
                ← Back to Home
              </button>
            </div>
            <RegionDetail item={selectedItem} />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <ProgressCard
                title="Exploration Progress Over Time"
                subtitle="Regions with 100% exploration"
                data={lineData}
                emptyMessage="Add completion dates to regions to see progress over time."
                lineColor="#2563eb"
                formatDate={formatDate}
              />
              <ProgressCard
                title="Oculi Progress Over Time"
                subtitle="Patches with all oculi collected"
                data={oculiData}
                emptyMessage="Track completion dates for oculi batches to see this chart."
                lineColor="#7c3aed"
                formatDate={formatDate}
              />
            </div>
            <SummaryCard pieData={visiblePieData} legendData={legendData} />
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressCard({ title, subtitle, data, emptyMessage, lineColor, formatDate }) {
  return (
    <div className="card flex-1">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="font-bold">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
      <div className="h-56">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <XAxis
                dataKey="date"
                tickFormatter={(d) => formatDate(d)}
                axisLine={{ stroke: "var(--chart-axis-color)", strokeDasharray: "3 3" }}
                tickLine={false}
                minTickGap={20}
              />
              <YAxis
                allowDecimals={false}
                axisLine={{ stroke: "var(--chart-axis-color)", strokeDasharray: "3 3" }}
                tickLine={false}
                width={40}
              />
              <Tooltip labelFormatter={(d) => `Date: ${formatDate(d)}`} formatter={(v) => [v, "Completed"]} />
              <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message={emptyMessage} />
        )}
      </div>
    </div>
  );
}

function SummaryCard({ pieData, legendData }) {
  return (
    <div className="card">
      <h2 className="font-bold mb-1">Exploration Progress Summary</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Breakdown of current region statuses across all nations.
      </p>
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
        <div className="flex flex-wrap justify-center lg:justify-start gap-4">
          {legendData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[entry.name] }}
              ></span>
              <span className="text-gray-700 dark:text-gray-200">{entry.name}</span>
            </div>
          ))}
        </div>
        <div className="w-full lg:w-1/2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData.length ? pieData : legendData.map((d) => ({ ...d, value: 0.0001 }))}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                innerRadius={50}
                paddingAngle={2}
                labelLine={false}
              >
                {(pieData.length ? pieData : legendData).map((entry, i) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, "Regions"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
      {message}
    </div>
  );
}
