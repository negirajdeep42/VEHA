import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchProducts } from '../features/products/productSlice';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';

export const SearchResults: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items: products, loading } = useAppSelector(state => state.products);
  const [queryInput, setQueryInput] = useState(searchParams.get('q') || '');

  useEffect(() => {
    dispatch(fetchProducts({ page: 0, size: 200 }));
  }, [dispatch]);

  const searchQuery = searchParams.get('q') || '';

  const results = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      setSearchParams({ q: queryInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="wrap sec text-left space-y-8">
      <div className="sec-head">
        <span className="eyebrow">House Finder</span>
        <h2 className="gold-text">Search Results</h2>
      </div>

      {/* Large search input */}
      <form onSubmit={handleSearchSubmit} className="max-w-[600px] flex border border-line-2 bg-noir-2">
        <input 
          type="text" 
          placeholder="Search for rings, necklaces, gold..." 
          className="flex-1 bg-transparent border-none outline-none p-4 text-cream font-light text-base"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
        />
        <button type="submit" className="btn solid !py-0 !px-8">Search</button>
      </form>

      <div>
        {searchQuery ? (
          <p className="text-sm font-light text-cream-soft mb-6">
            Showing results for "<span className="text-gold font-medium">{searchQuery}</span>" ({results.length} items found)
          </p>
        ) : (
          <p className="text-sm font-light text-cream-soft mb-6">Enter a search query to search the house collections.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <SkeletonLoader count={4} />
          ) : results.length > 0 ? (
            results.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : searchQuery ? (
            <div className="col-span-full text-center py-20 border border-dashed border-line text-cream-soft font-light">
              No matching jewelry found. Try searching for "Solitaire" or "Cuff".
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
export default SearchResults;
