import React from 'react';
import { IMAGES } from '../utils/imageConstants';

export const About: React.FC = () => {
  return (
    <div className="wrap sec space-y-16 text-left">
      <div className="sec-head">
        <span className="eyebrow">The Maison</span>
        <h2 className="gold-text">Our Story & Craftsmanship</h2>
      </div>

      {/* Hero row */}
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        <div className="flex-1 space-y-6 font-light text-sm text-cream-soft leading-relaxed">
          <h3 className="font-display text-2xl text-gold uppercase tracking-wider">The House of Veha</h3>
          <p>
            Founded with a vision to make premium, tarnish-resistant heirloom jewelry accessible for daily wear, the House of Veha blends age-old Indian goldsmith techniques with modern design standards.
          </p>
          <p>
            Every piece is designed from high-grade raw metals and hallmarked certified (BIS Gold Stamp and 925 sterling silver), guaranteeing that its value, purity, and shine will last a lifetime.
          </p>
        </div>
        <div className="flex-1 w-full h-[320px] overflow-hidden border border-line">
          <img 
            src={IMAGES.banners.about} 
            alt="Veha Jewelry workshop" 
            className="w-full h-full object-cover brightness-90 hover:scale-105 transition-all duration-700" 
          />
        </div>
      </div>

      {/* Craftsmanship details */}
      <div className="flex flex-col lg:flex-row gap-12 items-center">
        <div className="flex-1 w-full h-[320px] overflow-hidden border border-line order-last lg:order-first">
          <img 
            src={IMAGES.banners.featured} 
            alt="Hand-made fine jewelry crafting details" 
            className="w-full h-full object-cover brightness-90 hover:scale-105 transition-all duration-700" 
          />
        </div>
        <div className="flex-1 space-y-6 font-light text-sm text-cream-soft leading-relaxed">
          <h3 className="font-display text-2xl text-gold uppercase tracking-wider">Hand-finished Details</h3>
          <p>
            At our Mumbai ateliers, skilled gold artisans hand-set every stone, ensuring optimal reflection and grip. We use high-precision tools alongside classical jewelry hammers to carve waves and cuff shapes.
          </p>
          <p>
            All sterling silver items are coated with a rare layer of rhodium, preventing tarnish or oxidation, and preserving the cool, brilliant silver sheen for years to come.
          </p>
        </div>
      </div>
    </div>
  );
};
export default About;
