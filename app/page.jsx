"use client";

import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { nations, getItemById } from "../components/regionsData";
import {
  aggregateStatusCounts,
  aggregateOculiStatusCounts,
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
  const [oculiPieData, setOculiPieData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const refresh = () => {
      setPieData(aggregateStatusCounts());
      setOculiPieData(aggregateOculiStatusCounts());
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
  const visibleOculiPieData = useMemo(() => oculiPieData.filter((d) => d.value > 0), [oculiPieData]);
  const oculiLegendData = useMemo(() => oculiPieData.map((d) => ({ ...d, color: STATUS_COLORS[d.name] })), [oculiPieData]);
  
  const totalRegions = useMemo(() => pieData.reduce((sum, d) => sum + d.value, 0), [pieData]);
  const totalPatches = useMemo(() => oculiPieData.reduce((sum, d) => sum + d.value, 0), [oculiPieData]);

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
              <SummaryCard 
                pieData={visiblePieData} 
                legendData={legendData} 
                title="Exploration Progress Summary"
                subtitle="Breakdown of current region statuses across all nations."
                total={totalRegions}
                unit="Regions"
              />
              <SummaryCard 
                pieData={visibleOculiPieData} 
                legendData={oculiLegendData} 
                title="Oculi Progress Summary"
                subtitle="Breakdown of current oculi patch statuses across all nations."
                total={totalPatches}
                unit="Patches"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ pieData, legendData, title, subtitle, total, unit }) {
  const getStatusEmoji = (status) => {
    if (status === "Complete") return "🟩";
    if (status === "Working on it") return "🟨";
    return "🟥";
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload[0]) return null;
    const data = payload[0];
    const status = data.name;
    const value = data.value;
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    const emoji = getStatusEmoji(status);
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 shadow-lg">
        <p className="text-sm font-medium">
          {emoji} {status}: {value} {unit} ({percentage}%)
        </p>
      </div>
    );
  };

  return (
    <div className="card flex-1">
      <h2 className="font-bold mb-1">{title}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {subtitle}
      </p>
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-wrap justify-center gap-4">
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
        <div className="w-full h-64 flex justify-center">
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
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
