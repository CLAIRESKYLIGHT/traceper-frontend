import React from "react";

export default function SkeletonLoader({ type = "card", count = 1 }) {
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-teal-100 p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-teal-200 rounded-xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-teal-200 rounded w-3/4"></div>
          <div className="h-3 bg-teal-100 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-teal-100 rounded"></div>
        <div className="h-3 bg-teal-100 rounded w-5/6"></div>
      </div>
    </div>
  );

  const SkeletonStat = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-teal-100 p-8 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="w-16 h-16 bg-teal-200 rounded-xl"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-teal-200 rounded w-1/3"></div>
        <div className="h-10 bg-teal-200 rounded w-2/3"></div>
      </div>
    </div>
  );

  const SkeletonTable = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-teal-100 p-6 animate-pulse">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-teal-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-teal-200 rounded w-3/4"></div>
              <div className="h-3 bg-teal-100 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-teal-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case "stat":
        return <SkeletonStat />;
      case "table":
        return <SkeletonTable />;
      case "card":
      default:
        return <SkeletonCard />;
    }
  };

  return (
    <div className={count > 1 ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : ""}>
      {[...Array(count)].map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}

