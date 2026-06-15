import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-noir-2 border border-line animate-pulse">
          <div className="aspect-ratio-1 w-full h-[250px] bg-noir-3" />
          <div className="p-5 space-y-3">
            <div className="h-6 bg-noir-4 w-3/4" />
            <div className="h-4 bg-noir-4 w-1/2" />
            <div className="h-5 bg-noir-4 w-1/3" />
            <div className="h-10 bg-noir-4 w-full" />
          </div>
        </div>
      ))}
    </>
  );
};
export default SkeletonLoader;
