import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchProducts, fetchCategories } from '../features/products/productSlice';
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
  const [priceRange, setPriceRange] = useState<number>(300000); // Default to max price to display all items initially
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12; // 12 items per page aligns perfectly with 4-column rows on desktop

  useEffect(() => {
    dispatch(fetchProducts({ page: 0, size: 200 }));
    dispatch(fetchCategories());
    dispatch(fetchWishlist());
  }, [dispatch]);

  // Sync category, sort/featured, and search params from URL changes
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    setSelectedCategory(cat);
    
    const sort = searchParams.get('sort') || '';
    const featured = searchParams.get('featured') || '';
    if (sort) {
      setSortBy(sort);
    } else if (featured === 'bestseller') {
      setSortBy('bestseller');
    } else {
      setSortBy('featured');
    }
    
    const search = searchParams.get('search') || '';
    setSearchQuery(search);
    
    setCurrentPage(0);
  }, [searchParams]);

  // Apply filters and sorting locally
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
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id);
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

  const resetAllFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setPriceRange(300000);
    setSortBy('featured');
    setSearchParams({});
    setCurrentPage(0);
  };

  return (
    <div className="wrap sec max-w-7xl mx-auto px-4 md:px-6">
      
      {/* Luxury Shop Hero Section with thin gold border frame & filigree SVGs */}
      <div className="relative border border-gold/30 bg-black py-12 px-6 md:px-12 mb-10 text-center flex flex-col items-center justify-center min-h-[200px] overflow-hidden">
        {/* Left SVG Filigree Ornament */}
        <div className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 opacity-20 md:opacity-35 pointer-events-none w-24 h-24 md:w-36 md:h-36 text-gold">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full animate-pulse">
            <circle cx="50" cy="50" r="45" strokeDasharray="1 3" />
            <circle cx="50" cy="50" r="38" opacity="0.5" />
            <path d="M50 5 C35 25, 15 35, 50 95 C85 35, 65 25, 50 5 Z" strokeWidth="0.3" />
            <path d="M5 50 C25 35, 35 15, 95 50 C35 85, 25 65, 5 50 Z" strokeWidth="0.3" />
            <circle cx="50" cy="50" r="22" />
            <circle cx="50" cy="50" r="12" strokeDasharray="1 1" />
            <path d="M30 30 L70 70 M30 70 L70 30" />
            <path d="M50 20 C45 35, 35 45, 50 80 C65 45, 55 35, 50 20 Z" fill="currentColor" opacity="0.1" strokeWidth="0.2" />
            <path d="M20 50 C35 45, 45 35, 80 50 C45 65, 35 55, 20 50 Z" fill="currentColor" opacity="0.1" strokeWidth="0.2" />
          </svg>
        </div>
        
        {/* Right SVG Filigree Ornament */}
        <div className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 opacity-20 md:opacity-35 pointer-events-none w-24 h-24 md:w-36 md:h-36 text-gold">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-full h-full transform scale-x-[-1] animate-pulse">
            <circle cx="50" cy="50" r="45" strokeDasharray="1 3" />
            <circle cx="50" cy="50" r="38" opacity="0.5" />
            <path d="M50 5 C35 25, 15 35, 50 95 C85 35, 65 25, 50 5 Z" strokeWidth="0.3" />
            <path d="M5 50 C25 35, 35 15, 95 50 C35 85, 25 65, 5 50 Z" strokeWidth="0.3" />
            <circle cx="50" cy="50" r="22" />
            <circle cx="50" cy="50" r="12" strokeDasharray="1 1" />
            <path d="M30 30 L70 70 M30 70 L70 30" />
            <path d="M50 20 C45 35, 35 45, 50 80 C65 45, 55 35, 50 20 Z" fill="currentColor" opacity="0.1" strokeWidth="0.2" />
            <path d="M20 50 C35 45, 45 35, 80 50 C45 65, 35 55, 20 50 Z" fill="currentColor" opacity="0.1" strokeWidth="0.2" />
          </svg>
        </div>

        <span className="text-[10px] tracking-[0.3em] text-gold/80 uppercase font-display mb-3">VEHA Signature Collections</span>
        <h1 className="shine font-display text-4xl md:text-5xl tracking-[0.25em] text-gold uppercase pl-[0.25em] leading-tight">All Jewellery</h1>
        <p className="font-serif italic text-cream-soft text-sm md:text-base max-w-[580px] mx-auto mt-4 font-light leading-relaxed">
          Heirloom details, hallmarked quality, and designs finished by hand.
        </p>
      </div>

      {/* Row 1: Premium Luxury Category Pills */}
      <div className="w-full flex flex-wrap items-center gap-4 justify-center mb-8">
        {[
          { name: 'ALL JEWELLERY', value: '' },
          { name: 'RINGS', value: 'rings' },
          { name: 'EARRINGS', value: 'earrings' },
          { name: 'NECKLACES', value: 'necklaces' },
          { name: 'BRACELETS', value: 'bracelets' },
          { name: 'BANGLES', value: 'bangles' },
        ].map(cat => {
          const isActive = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              className={`text-[9.5px] tracking-[0.22em] uppercase py-3 px-6 border rounded transition-all duration-300 font-display cursor-pointer ${
                isActive
                  ? 'bg-gold text-noir border-gold font-semibold shadow-[0_0_15px_rgba(217,184,92,0.35)]'
                  : 'bg-black text-gold border-gold/40 hover:bg-gold/10 hover:shadow-[0_0_10px_rgba(217,184,92,0.25)]'
              }`}
              onClick={() => handleCategoryChange(cat.value)}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Row 2: Search Input, Product Counter, Sort Dropdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center gap-6 mb-8 pb-6 border-b border-line w-full">
        
        {/* Left: Compact Search bar with Left Icon */}
        <div className="flex justify-center md:justify-start">
          <div className="relative border border-gold/40 bg-black rounded-full px-4.5 flex items-center transition-all duration-300 focus-within:border-gold focus-within:shadow-[0_0_15px_rgba(217,184,92,0.3)] h-12 w-full max-w-[320px]">
            <span className="text-gold flex items-center justify-center pointer-events-none mr-3">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
              </svg>
            </span>
            <input 
              type="text" 
              placeholder="Search premium jewelry..." 
              className="bg-transparent border-none outline-none text-xs text-cream w-full font-display uppercase tracking-widest placeholder-gold/40 focus:ring-0 focus:outline-none"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Center: Showing Products Counter with Scroll Ornaments */}
        <div className="flex justify-center items-center gap-3 py-2 md:py-0">
          <svg className="w-6 h-3 text-gold/60" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M2 6h20M2 6c4-4 8-4 12 0M2 6c4 4 8 4 12 0" />
          </svg>
          <span className="text-[10.5px] uppercase tracking-[0.22em] text-cream-soft font-display font-light">
            Showing <span className="text-gold font-semibold">{filteredAndSortedProducts.length}</span> Products
          </span>
          <svg className="w-6 h-3 text-gold/60 transform scale-x-[-1]" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M2 6h20M2 6c4-4 8-4 12 0M2 6c4 4 8 4 12 0" />
          </svg>
        </div>

        {/* Right: Custom Luxury Sort Dropdown */}
        <div className="flex items-center gap-3 justify-center md:justify-end">
          <span className="text-[10px] uppercase tracking-[0.2em] text-cream-soft font-display whitespace-nowrap">Sort By:</span>
          <div className="relative w-48">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full appearance-none bg-black border border-gold/40 px-4 py-2.5 pr-10 text-[10px] text-gold uppercase tracking-[0.2em] outline-none font-display cursor-pointer transition-all duration-300 hover:border-gold hover:shadow-[0_0_10px_rgba(217,184,92,0.2)] focus:border-gold focus:shadow-[0_0_15px_rgba(217,184,92,0.35)]"
            >
              <option value="featured" className="bg-black text-gold">Featured</option>
              <option value="bestseller" className="bg-black text-gold">Best Selling</option>
              <option value="newest" className="bg-black text-gold">Newest</option>
              <option value="priceLow" className="bg-black text-gold">Price: Low to High</option>
              <option value="priceHigh" className="bg-black text-gold">Price: High to Low</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gold">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Horizontal Price Limit Slider (Full Width) */}
      <div className="w-full mb-10 space-y-2 border-b border-line pb-6 text-left">
        <div className="flex justify-between items-baseline">
          <h4 className="font-display text-[11px] tracking-[0.22em] uppercase text-gold font-semibold">Price Limit</h4>
          <span className="text-gold text-xs font-semibold font-display bg-black px-3 py-1 border border-gold/30">Under ₹{priceRange.toLocaleString('en-IN')}</span>
        </div>
        <div className="relative w-full pt-2">
          <input 
            type="range" 
            min="5000" 
            max="300000" 
            step="5000"
            className="w-full accent-gold cursor-pointer"
            value={priceRange}
            onChange={(e) => {
              setPriceRange(parseInt(e.target.value));
              setCurrentPage(0);
            }}
          />
          <div className="flex justify-between items-center text-[10px] text-cream-soft font-display tracking-widest mt-2">
            <span>₹5,000</span>
            <span>₹3,00,000</span>
          </div>
        </div>
      </div>

      {/* Row 4: Product Grid Area (Full Width, 4 Columns) */}
      <div className="w-full space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <SkeletonLoader count={8} />
          ) : paginatedProducts.length > 0 ? (
            paginatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            /* Luxury Empty State Design */
            <div className="col-span-full text-center py-24 border border-dashed border-line bg-noir-2 flex flex-col items-center justify-center p-8 space-y-4">
              <svg className="w-12 h-12 text-gold/40 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>
              </svg>
              <h3 className="font-display text-base tracking-widest text-gold uppercase">No Jewelry Items Found</h3>
              <p className="text-xs font-light text-cream-soft max-w-[340px] leading-relaxed">
                We couldn't find any pieces matching your current filter selections. Try adjusting your filters or price range.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="btn line !py-2.5 !px-5 text-[10px] mt-2"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Luxury Numbered Pagination: < 1 2 > */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-8 border-t border-line">
            <button
              type="button"
              className="text-sm tracking-widest text-cream-soft hover:text-gold disabled:opacity-30 disabled:hover:text-cream-soft transition duration-300 px-3 py-2 cursor-pointer disabled:cursor-not-allowed font-bold"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              &lt;
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`w-8 h-8 rounded-none border text-xs tracking-wider font-display transition duration-300 cursor-pointer ${
                    currentPage === i 
                      ? 'bg-gold text-noir border-gold font-bold' 
                      : 'bg-transparent text-cream border-gold/10 hover:border-gold/40 hover:text-gold'
                  }`}
                  onClick={() => setCurrentPage(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="text-sm tracking-widest text-cream-soft hover:text-gold disabled:opacity-30 disabled:hover:text-cream-soft transition duration-300 px-3 py-2 cursor-pointer disabled:cursor-not-allowed font-bold"
              disabled={currentPage === totalPages - 1}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
