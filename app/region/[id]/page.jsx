"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import RegionDetail from "../../../components/RegionDetail";
import { getItemById } from "../../../components/regionsData";

export default function RegionPage() {
  const params = useParams();
  const regionId = decodeURIComponent(params.id);

  const item = useMemo(() => {
    const found = getItemById(regionId);
    if (found) return found;
    return {
      id: regionId,
      title: regionId,
      subtitle: "Custom entry",
    };
  }, [regionId]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <RegionDetail item={item} />
    </div>
  );
}

