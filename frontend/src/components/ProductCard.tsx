import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useAppDispatch, useAppSelector } from '../app/store';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { addToCart } from '../features/cart/cartSlice';

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
    <Link className="card" to={`/product/${product.id}`} data-id={product.id}>
      <div className="ph">
        {product.bestseller && <span className="badge">Bestseller</span>}
        
        <button 
          className={`heart ${isSaved ? 'on' : ''}`} 
          onClick={handleWishlist}
          aria-label="Save to Wishlist"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 20s-7-4.4-9.3-9C1 7.7 3 4.5 6.2 4.5c2 0 3.3 1.2 4.1 2.4l1.7 2 1.7-2c.8-1.2 2.1-2.4 4.1-2.4 3.2 0 5.2 3.2 3.5 6.5C19 15.6 12 20 12 20Z"/>
          </svg>
        </button>

        {/* Render Vector SVG if exists, otherwise fallback to thumbnail */}
        {product.svgRender ? (
          <div dangerouslySetInnerHTML={{ __html: product.svgRender }} className="w-full h-full flex items-center justify-center" />
        ) : (
          <img 
            src={`/images/products/${product.slug}.jpeg`} 
            alt={product.name} 
            className="render object-cover w-full h-full"
            loading="lazy"
          />
        )}
      </div>
      <div className="info">
        <div className="nm">{product.name}</div>
        <div className="meta">{product.categoryName || 'Jewellery'} &middot; 22k gold</div>
        <div className="price mb-4">
          <span className="now">₹{product.price.toLocaleString('en-IN')}</span>
          {product.wasPrice && (
            <span className="was">₹{product.wasPrice.toLocaleString('en-IN')}</span>
          )}
          {product.discountPercent && (
            <span className="off">{product.discountPercent}% off</span>
          )}
        </div>
        <button 
          className="btn solid !w-full justify-center !py-3 !text-[10px]"
          type="button"
          disabled={adding}
          onClick={handleAddBag}
        >
          {adding ? 'Adding...' : 'Add to bag'}
        </button>
      </div>
    </Link>
  );
};
export default ProductCard;
