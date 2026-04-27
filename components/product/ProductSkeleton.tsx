export default function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-xl aspect-square" />
      <div className="mt-2 space-y-1.5 px-1">
        <div className="h-3.5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}