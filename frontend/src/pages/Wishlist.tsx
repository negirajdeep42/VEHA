import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchWishlist } from '../features/wishlist/wishlistSlice';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';

export const Wishlist: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: wishlist, loading, error } = useAppSelector(state => state.wishlist);
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  return (
    <div className="wrap sec text-left flex flex-col lg:flex-row gap-12">
      
      {/* Profile Sidebar */}
      {user && (
        <aside className="w-full lg:w-[260px] flex-shrink-0 space-y-6 pr-0 lg:pr-6 border-r border-line">
          <div className="space-y-1">
            <h3 className="font-display text-xl text-gold uppercase tracking-wider">{user.name}</h3>
            <p className="text-xs text-cream-soft font-light">{user.email}</p>
          </div>
          <div className="rule !mx-0"></div>
          <div className="flex flex-col gap-3">
            <Link to="/profile" className="text-sm text-cream-soft hover:text-gold tracking-wide transition">Personal Details</Link>
            <Link to="/orders" className="text-sm text-cream-soft hover:text-gold tracking-wide transition">My Purchase Orders</Link>
            <Link to="/wishlist" className="text-sm text-gold font-medium tracking-wide">Wishlist Saved Items</Link>
          </div>
        </aside>
      )}

      {/* Wishlist Grid */}
      <div className="flex-1 space-y-6">
        <h3 className="font-display text-2xl text-gold uppercase tracking-wider border-b border-line pb-3">My Wishlist</h3>

        {loading && wishlist.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonLoader count={3} />
          </div>
        ) : error ? (
          <p className="text-sm text-err bg-err/10 border border-err/20 p-3 text-center">{error}</p>
        ) : wishlist.length === 0 ? (
          <div className="border border-dashed border-line p-12 text-center space-y-4">
            <p className="text-cream-soft font-light">Your wishlist is currently empty.</p>
            <Link to="/shop" className="btn solid">Browse collection</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map(product => (
              <ProductCard key={product.id} product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description || '',
                price: product.price,
                wasPrice: product.wasPrice,
                discountPercent: product.discountPercent,
                svgRender: product.svgRender,
                featured: false,
                bestseller: false,
                stock: 10
              }} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
export default Wishlist;
