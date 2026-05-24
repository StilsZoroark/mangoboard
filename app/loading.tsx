export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Skeleton Heading */}
        <div className="text-center mb-10">
          <div className="h-9 w-48 bg-gray-200 rounded mx-auto animate-pulse" />
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse mt-4" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}