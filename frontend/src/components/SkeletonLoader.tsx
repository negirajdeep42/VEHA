import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="card overflow-hidden pointer-events-none">
          {/* Image Placeholder */}
          <div className="ph">
            <div className="w-full h-full shimmer-bg" />
            {/* Heart shape placeholder */}
            <div className="heart opacity-40 border border-line">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4 text-cream-soft">
                <path d="M12 20s-7-4.4-9.3-9C1 7.7 3 4.5 6.2 4.5c2 0 3.3 1.2 4.1 2.4l1.7 2 1.7-2c.8-1.2 2.1-2.4 4.1-2.4 3.2 0 5.2 3.2 3.5 6.5C19 15.6 12 20 12 20Z"/>
              </svg>
            </div>
          </div>
          
          {/* Info Placeholder */}
          <div className="info">
            {/* Title / Name */}
            <div className="h-[28px] w-3/4 rounded-sm shimmer-bg mb-2" />
            
            {/* Meta */}
            <div className="h-[16px] w-1/2 rounded-sm shimmer-bg mb-4" />
            
            {/* Price Line */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-[20px] w-24 rounded-sm shimmer-gold" />
              <div className="h-[16px] w-16 rounded-sm shimmer-bg" />
            </div>
            
            {/* Add to Bag Button */}
            <div className="h-[42px] w-full rounded-sm shimmer-gold" />
          </div>
        </div>
      ))}
    </>
  );
};
export default SkeletonLoader;

