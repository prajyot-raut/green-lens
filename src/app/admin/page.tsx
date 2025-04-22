"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import Loading from "@/components/Loading"; // Assuming you have a Loading component

export default function AdminPage() {
  // Dynamically import the AdminMap component with SSR disabled
  const AdminMapWithNoSSR = useMemo(
    () =>
      dynamic(() => import("@/components/AdminMap"), {
        loading: () => <Loading />,
        ssr: false, // This line is important
      }),
    []
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Optional: Add a header or other admin elements here */}
      {/* <header className="bg-gray-800 text-white p-4">Admin Panel Header</header> */}

      {/* Render the dynamically imported map component */}
      <div className="flex-grow">
        <AdminMapWithNoSSR />
      </div>
    </div>
  );
}
