"use client";

import { useParams } from "next/navigation";
import RegionDetail from "../../../components/RegionDetail";

export default function RegionPage() {
  const params = useParams();
  const regionName = decodeURIComponent(params.id);
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <RegionDetail regionName={regionName} />
    </div>
  );
}

