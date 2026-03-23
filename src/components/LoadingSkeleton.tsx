"use client";

export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-8 bg-pink-100 rounded-2xl w-2/3" />
      <div className="h-4 bg-pink-50 rounded-xl w-full" />
      <div className="flex justify-center py-6">
        <div className="w-40 h-40 bg-pink-50 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-pink-50 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-3 mt-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-pink-50 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
