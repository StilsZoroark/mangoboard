"use client"; // Required for the retry button to work

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route-level error caught:", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load feed</h2>
        <p className="text-gray-600 mb-6">We couldn't fetch today's news. This is usually a temporary network issue.</p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}