import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mb-4"></div>
      <div className="text-white text-xl font-semibold">Loading...</div>
      <p className="text-gray-300 mt-2 text-center max-w-md px-4">
        Please wait while we prepare your content
      </p>
    </div>
  );
};

export default Loading;
