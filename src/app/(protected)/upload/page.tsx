"use client";

import UploadImage from "@/components/UploadImage";

export default function UploadPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Upload Image</h1>
      <UploadImage />
    </div>
  );
}
