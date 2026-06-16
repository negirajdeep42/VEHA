import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useAppDispatch, useAppSelector } from '../app/store';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { addToCart } from '../features/cart/cartSlice';
import { handleImageError } from '../utils/imageConstants';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const isSaved = wishlistItems.some(item => item.id === product.id);
  const [adding, setAdding] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
  };

  const handleAddBag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    dispatch(addToCart({
      productId: product.id,
      name: product.name,
      variant: 'Standard',
      price: product.price,
      qty: 1,
      svg: product.svgRender
    })).finally(() => {
      setAdding(false);
    });
  };

  return (
    <div className="card group flex flex-col justify-between h-full bg-black border border-gold/30 hover:border-gold hover:shadow-[0_0_20px_rgba(217,184,92,0.15)] transition-all duration-300" data-id={product.id}>
      <Link className="block relative overflow-hidden flex-shrink-0" to={`/product/${product.id}`}>
        <div className="ph relative overflow-hidden flex-shrink-0 aspect-square">
          {product.bestseller ? (
            <span className="badge z-20 absolute top-3 left-3 bg-gold text-noir text-[8px] uppercase tracking-widest px-2 py-1 font-semibold font-display">
              Bestseller
            </span>
          ) : product.featured ? (
            <span className="badge z-20 absolute top-3 left-3 bg-gold-l text-noir text-[8px] uppercase tracking-widest px-2 py-1 font-semibold font-display">
              New Arrival
            </span>
          ) : null}
          
          <button 
            className={`heart z-20 absolute top-3 right-3 transition-all duration-300 ${isSaved ? 'on opacity-100' : 'opacity-0 group-hover:opacity-100'}`} 
            onClick={handleWishlist}
            aria-label="Save to Wishlist"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4">
              <path d="M12 20s-7-4.4-9.3-9C1 7.7 3 4.5 6.2 4.5c2 0 3.3 1.2 4.1 2.4l1.7 2 1.7-2c.8-1.2 2.1-2.4 4.1-2.4 3.2 0 5.2 3.2 3.5 6.5C19 15.6 12 20 12 20Z"/>
            </svg>
          </button>

          {/* Render Vector SVG if inline exists, otherwise render as image path */}
          {product.svgRender && product.svgRender.trim().startsWith('<') ? (
            <div dangerouslySetInnerHTML={{ __html: product.svgRender }} className="w-full h-full flex items-center justify-center transition-transform duration-700 group-hover:scale-108" />
          ) : (
            <img 
              src={product.svgRender || `/images/products/${product.slug}.jpeg`} 
              alt={product.name} 
              className="render object-cover w-full h-full transition-transform duration-700 group-hover:scale-108"
              loading="lazy"
              onError={handleImageError}
            />
          )}
        </div>
      </Link>
      
      {/* Product Information Details Area */}
      <Link className="info flex-grow flex flex-col justify-between p-4 bg-black" to={`/product/${product.id}`}>
        <div className="space-y-1.5 text-left">
          <div className="nm truncate font-display text-base text-cream hover:text-gold transition duration-200" title={product.name}>
            {product.name}
          </div>
          
          {/* ✓ BIS Hallmarked Badge */}
          <div className="flex items-center gap-1.5 text-[9px] text-gold/90 font-display uppercase tracking-widest mt-1">
            <svg className="w-3.5 h-3.5 text-gold flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 11 2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="font-semibold">✓ BIS Hallmarked</span>
          </div>

          {/* Category & Metal Specification */}
          <div className="text-[9px] uppercase tracking-widest text-cream-dim font-display mt-0.5">
            {product.categoryName || 'Jewellery'} &bull; 22K GOLD
          </div>

          {/* Star Ratings */}
          <div className="flex items-center gap-1 pt-0.5">
            <span className="text-gold text-[10px] tracking-wider">★★★★★</span>
            <span className="text-[9px] text-cream-soft tracking-wider mt-0.5 ml-1">(4.8)</span>
          </div>
        </div>
        
        <div className="pt-3">
          <div className="price flex items-baseline gap-2.5 flex-wrap">
            <span className="now text-base font-semibold text-gold">₹{product.price.toLocaleString('en-IN')}</span>
            {product.wasPrice && (
              <span className="was text-xs text-cream-dim line-through">₹{product.wasPrice.toLocaleString('en-IN')}</span>
            )}
            {product.discountPercent && (
              <span className="off text-xs text-gold font-semibold uppercase tracking-wider">{product.discountPercent}% OFF</span>
            )}
          </div>
        </div>
      </Link>

      {/* Bottom Button Row */}
      <div className="flex border-t border-gold/30 w-full">
        <button 
          type="button"
          onClick={handleAddBag}
          disabled={adding}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-display uppercase tracking-widest text-gold bg-black hover:bg-gold hover:text-black transition duration-300 border-r border-gold/30 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {adding ? 'Adding...' : 'Add To Bag'}
        </button>
        <Link 
          to={`/product/${product.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-display uppercase tracking-widest text-gold bg-black hover:bg-gold hover:text-black transition duration-300 border-r border-gold/30 cursor-pointer text-center"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Quick View
        </Link>
        <button 
          type="button"
          onClick={handleWishlist}
          className="px-4 flex items-center justify-center text-gold bg-black hover:bg-gold hover:text-black transition duration-300 cursor-pointer"
          aria-label="Toggle Wishlist"
        >
          <svg className={`w-3.5 h-3.5 ${isSaved ? 'fill-gold stroke-gold' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
export default ProductCard;
