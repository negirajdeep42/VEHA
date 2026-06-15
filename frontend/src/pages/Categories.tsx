import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../utils/imageConstants';

export const Categories: React.FC = () => {
  const categories = [
    { name: 'Rings', slug: 'rings', img: IMAGES.categories.rings, desc: 'Solitaires, bands, and statement halos.' },
    { name: 'Earrings', slug: 'earrings', img: IMAGES.categories.earrings, desc: 'Classic studs, fine hoops, and dramatic drops.' },
    { name: 'Necklaces', slug: 'necklaces', img: IMAGES.categories.necklaces, desc: 'Delicate chains, minimal pendants, and layered links.' },
    { name: 'Bracelets', slug: 'bracelets', img: IMAGES.categories.bracelets, desc: 'Tennis cuffs, wave cuffs, and delicate chains.' },
  ];

  return (
    <div className="wrap sec space-y-12 text-left">
      <div className="sec-head">
        <span className="eyebrow">House Collections</span>
        <h2 className="gold-text">Categories</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map(cat => (
          <Link 
            key={cat.slug} 
            to={`/shop?category=${cat.slug}`}
            className="group block border border-line bg-noir-2 overflow-hidden hover:border-line-2 transition duration-300"
          >
            <div className="h-[280px] overflow-hidden relative">
              <img 
                src={cat.img} 
                alt={cat.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-noir-2 via-transparent to-transparent opacity-60"></div>
            </div>
            <div className="p-6 space-y-2">
              <h3 className="font-display text-xl text-gold uppercase tracking-wider">{cat.name}</h3>
              <p className="text-sm font-light text-cream-soft">{cat.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default Categories;
