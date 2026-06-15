import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchProducts } from '../features/products/productSlice';
import { fetchWishlist } from '../features/wishlist/wishlistSlice';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';

export const Shop: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { items: products, loading } = useAppSelector(state => state.products);
  
  // Local Filter & Sorting states
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [priceRange, setPriceRange] = useState<number>(3000);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
    // Fetch all products (large size parameter to get complete list for client side filters/pagination)
    dispatch(fetchProducts({ page: 0, size: 200 }));
    dispatch(fetchWishlist());
  }, [dispatch]);

  // Sync category param from URL changes
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    setSelectedCategory(cat);
    setCurrentPage(0);
  }, [searchParams]);

  // Apply filters and sorting locally for total count calculations
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory) {
      result = result.filter(p => p.categorySlug === selectedCategory || p.categoryName?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );
    }

    // Price Filter
    result = result.filter(p => p.price <= priceRange);

    // Sorting
    if (sortBy === 'priceLow') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceHigh') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'bestseller') {
      result.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
    } else {
      // Default / Featured
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy, priceRange]);

  // Paginated chunk
  const paginatedProducts = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return filteredAndSortedProducts.slice(start, start + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(0);
    setSearchParams(prev => {
      if (cat) prev.set('category', cat);
      else prev.delete('category');
      return prev;
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    setCurrentPage(0);
    setSearchParams(prev => {
      if (q) prev.set('search', q);
      else prev.delete('search');
      return prev;
    });
  };

  return (
    <div className="wrap sec">
      <div className="sec-head">
        <span className="eyebrow">Collections</span>
        <h2 className="gold-text">All Jewellery</h2>
        <p>Heirloom details, hallmarked quality, and designs finished by hand.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-[260px] flex-shrink-0 space-y-8 pr-0 lg:pr-6 border-r border-line">
          
          {/* Search bar */}
          <div className="space-y-3">
            <h4 className="font-display text-sm tracking-wider uppercase text-gold">Search</h4>
            <div className="border border-line-2 bg-noir-2 px-3 py-2 flex items-center">
              <input 
                type="text" 
                placeholder="Search jewellery..." 
                className="bg-transparent border-none outline-none text-sm text-cream w-full font-light"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <svg className="w-4 h-4 text-cream-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
              </svg>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-display text-sm tracking-wider uppercase text-gold">Categories</h4>
            <div className="flex flex-col gap-2">
              {[
                { name: 'All Jewellery', value: '' },
                { name: 'Rings', value: 'rings' },
                { name: 'Earrings', value: 'earrings' },
                { name: 'Necklaces', value: 'necklaces' },
                { name: 'Bracelets', value: 'bracelets' },
              ].map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  className={`text-left text-sm py-1 font-light tracking-wide transition ${selectedCategory === cat.value ? 'text-gold font-medium pl-2 border-l border-gold' : 'text-cream-soft hover:text-gold'}`}
                  onClick={() => handleCategoryChange(cat.value)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <h4 className="font-display text-sm tracking-wider uppercase text-gold">Max Price</h4>
            <div className="space-y-2">
              <input 
                type="range" 
                min="500" 
                max="5000" 
                step="100"
                className="w-full accent-gold"
                value={priceRange}
                onChange={(e) => {
                  setPriceRange(parseInt(e.target.value));
                  setCurrentPage(0);
                }}
              />
              <div className="flex justify-between text-xs text-cream-soft font-light">
                <span>₹500</span>
                <span className="text-gold font-medium">Under ₹{priceRange.toLocaleString('en-IN')}</span>
                <span>₹5,000</span>
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div className="space-y-3">
            <h4 className="font-display text-sm tracking-wider uppercase text-gold">Sort By</h4>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full bg-noir-2 border border-line-2 px-3 py-2 text-sm text-cream outline-none font-light"
            >
              <option value="featured">Featured</option>
              <option value="bestseller">Bestseller</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <SkeletonLoader count={6} />
            ) : paginatedProducts.length > 0 ? (
              paginatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-20 border border-dashed border-line text-cream-soft">
                No jewelry items match your filters.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-6 border-t border-line">
              <button
                type="button"
                className="btn line !py-2.5 !px-5 text-xs"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </button>
              <span className="text-sm font-light text-cream-soft">
                Page <span className="text-gold font-medium">{currentPage + 1}</span> of {totalPages}
              </span>
              <button
                type="button"
                className="btn line !py-2.5 !px-5 text-xs"
                disabled={currentPage === totalPages - 1}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Shop;
