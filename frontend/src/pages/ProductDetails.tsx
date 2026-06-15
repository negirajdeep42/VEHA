import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchProductDetails } from '../features/products/productSlice';
import { toggleWishlist } from '../features/wishlist/wishlistSlice';
import { addToCart } from '../features/cart/cartSlice';
import { VehaApi } from '../utils/api';
import { WishlistItem, Review } from '../types';
import { IMAGES } from '../utils/imageConstants';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  
  const { selectedProduct: product, detailsLoading: loading, error } = useAppSelector(state => state.products);
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const isSaved = wishlistItems.some(item => item.id === product?.id);

  // Gallery Active Selection (0 = Front/SVG, 1 = Close Up Detail, 2 = Lifestyle Worn)
  const [activeThumb, setActiveThumb] = useState(0);

  // Variant States
  const [selectedMetal, setSelectedMetal] = useState('22k Yellow Gold');
  const [selectedSize, setSelectedSize] = useState('12');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  // Reviews States
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    if (id) {
      const pId = parseInt(id);
      dispatch(fetchProductDetails(pId));
      loadReviews(pId);
    }
  }, [id, dispatch]);

  const loadReviews = async (productId: number) => {
    try {
      const data = await VehaApi.getProductReviews(productId);
      setReviews(data);
    } catch (e) {
      console.error("Failed to load reviews:", e);
    }
  };

  // Calculate final price based on selected metal and size additional costs
  const finalPrice = (() => {
    if (!product) return 0;
    let base = product.price;
    
    // 18k Rose Gold adds 150, 925 Silver deducts 300
    if (selectedMetal === '18k Rose Gold') base += 150;
    else if (selectedMetal === '925 Silver') base -= 300;

    // Size 14 adds 50, 16 adds 100, 18 adds 150
    if (selectedSize === '14') base += 50;
    else if (selectedSize === '16') base += 100;
    else if (selectedSize === '18') base += 150;

    return base;
  })();

  const handleAddBag = () => {
    if (!product) return;
    setAdding(true);
    const variantInfo = `${selectedMetal} / Size ${selectedSize}`;
    
    dispatch(addToCart({
      productId: product.id,
      name: product.name,
      variant: variantInfo,
      price: finalPrice,
      qty: qty,
      svg: product.svgRender
    })).finally(() => {
      setAdding(false);
    });
  };

  const handleWishlist = () => {
    if (product) {
      dispatch(toggleWishlist(product));
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;

    setSubmittingReview(true);
    setReviewMsg('');
    try {
      await VehaApi.submitProductReview(parseInt(id), newRating, newComment);
      setReviewMsg("Review submitted successfully!");
      setNewComment('');
      loadReviews(parseInt(id));
    } catch (err: any) {
      setReviewMsg(err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="wrap sec text-center py-20">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
        <p className="mt-4 text-cream-soft font-light">Loading heirloom details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="wrap sec text-center py-20 space-y-4">
        <h3 className="font-display text-2xl text-gold">Jewelry Not Found</h3>
        <p className="text-cream-soft font-light">We couldn't retrieve the details for this piece.</p>
        <Link to="/shop" className="btn line">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="wrap sec space-y-16">
      
      {/* Breadcrumbs */}
      <nav className="text-xs tracking-wider uppercase text-cream-dim flex gap-2">
        <Link to="/" className="hover:text-gold">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-gold">Shop</Link>
        <span>/</span>
        <span className="text-gold">{product.name}</span>
      </nav>

      {/* Main product showcase */}
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left Side: Image Gallery */}
        <div className="flex-1 flex flex-col md:flex-row gap-4">
          
          {/* Thumbnails list */}
          <div className="flex flex-row md:flex-col order-last md:order-first gap-3 justify-center md:justify-start">
            <button 
              type="button"
              className={`w-16 h-16 border bg-noir-2 flex items-center justify-center transition p-1 ${activeThumb === 0 ? 'border-gold' : 'border-line hover:border-line-2'}`}
              onClick={() => setActiveThumb(0)}
            >
              {product.svgRender ? (
                <div dangerouslySetInnerHTML={{ __html: product.svgRender }} className="w-full h-full opacity-60" />
              ) : (
                <span className="text-[9px] uppercase tracking-wider text-gold">Front</span>
              )}
            </button>
            <button 
              type="button"
              className={`w-16 h-16 border bg-noir-2 flex items-center justify-center transition p-1 ${activeThumb === 1 ? 'border-gold' : 'border-line hover:border-line-2'}`}
              onClick={() => setActiveThumb(1)}
            >
              <img src={IMAGES.products.detailHero} alt="Detail view" className="w-full h-full object-cover" />
            </button>
            <button 
              type="button"
              className={`w-16 h-16 border bg-noir-2 flex items-center justify-center transition p-1 ${activeThumb === 2 ? 'border-gold' : 'border-line hover:border-line-2'}`}
              onClick={() => setActiveThumb(2)}
            >
              <img src={IMAGES.lifestyle.one} alt="Lifestyle view" className="w-full h-full object-cover" />
            </button>
          </div>

          {/* Large Main Display */}
          <div className="flex-1 border border-line aspect-square bg-radial-gradient flex items-center justify-center overflow-hidden relative">
            {activeThumb === 0 ? (
              product.svgRender ? (
                <div dangerouslySetInnerHTML={{ __html: product.svgRender }} className="w-4/5 h-4/5 transform scale-105" />
              ) : (
                <img 
                  src={`/images/products/${product.slug}.jpeg`} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              )
            ) : activeThumb === 1 ? (
              <img 
                src={IMAGES.products.detailHero} 
                alt="Close Up detail" 
                className="w-full h-full object-cover hover:scale-125 transition-transform duration-500 cursor-zoom-in"
              />
            ) : (
              <img 
                src={IMAGES.lifestyle.one} 
                alt="Lifestyle Worn" 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            )}
          </div>
        </div>

        {/* Right Side: Options & Add */}
        <div className="flex-1 space-y-6 text-left">
          <div>
            <span className="eyebrow">{product.categoryName || 'House of Veha'}</span>
            <h1 className="font-display text-4xl text-gold mt-2 mb-3">{product.name}</h1>
            <div className="flex items-center gap-2 text-xs text-cream-soft">
              <span className="text-gold">★★★★★</span>
              <span>({reviews.length} Customer Reviews)</span>
              <span>&middot;</span>
              <span className="text-gold-2">BIS Hallmarked 22k Gold / 925 Silver</span>
            </div>
          </div>

          <div className="price flex items-baseline gap-3">
            <span className="text-3xl font-medium text-gold">₹{finalPrice.toLocaleString('en-IN')}</span>
            {product.wasPrice && (
              <span className="text-lg text-cream-dim line-through">₹{product.wasPrice.toLocaleString('en-IN')}</span>
            )}
            {product.discountPercent && (
              <span className="text-xs bg-gold/10 text-gold px-2.5 py-1 font-medium">{product.discountPercent}% OFF</span>
            )}
          </div>

          <div className="rule !mx-0"></div>

          <p className="text-sm font-light text-cream-soft leading-relaxed">
            {product.description || "Crafted in hallmarked premium gold and finished with meticulous polish. Guaranteed tarnish resistant and made for lifetime brilliance."}
          </p>

          {/* Metal selection */}
          <div className="space-y-3">
            <h4 className="font-display text-xs tracking-wider uppercase text-gold">Select Metal</h4>
            <div className="flex gap-2">
              {['22k Yellow Gold', '18k Rose Gold', '925 Silver'].map(metal => (
                <button
                  key={metal}
                  type="button"
                  onClick={() => setSelectedMetal(metal)}
                  className={`border text-xs px-4 py-2.5 transition uppercase tracking-wider ${selectedMetal === metal ? 'border-gold text-gold bg-noir-3' : 'border-line text-cream-soft hover:border-line-2'}`}
                >
                  {metal}
                </button>
              ))}
            </div>
          </div>

          {/* Size selection */}
          <div className="space-y-3">
            <h4 className="font-display text-xs tracking-wider uppercase text-gold">Select Size</h4>
            <div className="flex gap-2">
              {['10', '12', '14', '16', '18'].map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`border text-xs w-10 h-10 flex items-center justify-center transition ${selectedSize === size ? 'border-gold text-gold bg-noir-3' : 'border-line text-cream-soft hover:border-line-2'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Qty & Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center border border-line-2">
              <button 
                type="button"
                className="w-10 h-10 flex items-center justify-center text-cream-soft hover:text-gold"
                onClick={() => setQty(prev => Math.max(1, prev - 1))}
              >
                &minus;
              </button>
              <span className="w-10 text-center text-sm font-light">{qty}</span>
              <button 
                type="button"
                className="w-10 h-10 flex items-center justify-center text-cream-soft hover:text-gold"
                onClick={() => setQty(prev => prev + 1)}
              >
                &#43;
              </button>
            </div>

            <button 
              type="button"
              className="btn solid flex-1 justify-center"
              onClick={handleAddBag}
              disabled={adding || product.stock <= 0}
            >
              {adding ? 'Adding...' : product.stock > 0 ? 'Add to bag' : 'Out of stock'}
            </button>

            <button 
              type="button"
              className={`border w-12 h-12 flex items-center justify-center transition ${isSaved ? 'border-gold text-gold bg-noir-3' : 'border-line text-cream-soft hover:border-line-2'}`}
              onClick={handleWishlist}
              aria-label="Wishlist"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 20s-7-4.4-9.3-9C1 7.7 3 4.5 6.2 4.5c2 0 3.3 1.2 4.1 2.4l1.7 2 1.7-2c.8-1.2 2.1-2.4 4.1-2.4 3.2 0 5.2 3.2 3.5 6.5C19 15.6 12 20 12 20Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="border-t border-line pt-12 text-left">
        <h3 className="font-display text-2xl text-gold mb-6">Customer Reviews</h3>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Reviews list */}
          <div className="flex-1 space-y-6">
            {reviews.length > 0 ? (
              reviews.map(rev => (
                <div key={rev.id} className="border-b border-line pb-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xs text-gold uppercase tracking-wider">{rev.customerName}</span>
                    <span className="text-xs text-cream-dim">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-gold text-xs">
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                  </div>
                  <p className="text-sm font-light text-cream-soft italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))
            ) : (
              <p className="text-cream-soft font-light text-sm italic">No reviews yet for this piece. Be the first to share your thoughts!</p>
            )}
          </div>

          {/* Review write form */}
          <div className="w-full lg:w-[400px] bg-noir-2 border border-line p-6 self-start">
            <h4 className="font-display text-lg text-gold mb-4 uppercase tracking-wider">Write a Review</h4>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-cream-soft uppercase tracking-wider">Rating</label>
                <select 
                  value={newRating} 
                  onChange={(e) => setNewRating(parseInt(e.target.value))}
                  className="w-full bg-noir border border-line-2 px-3 py-2 text-sm text-cream outline-none"
                >
                  <option value={5}>5 Stars (Excellent)</option>
                  <option value={4}>4 Stars (Very Good)</option>
                  <option value={3}>3 Stars (Average)</option>
                  <option value={2}>2 Stars (Poor)</option>
                  <option value={1}>1 Star (Very Poor)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-cream-soft uppercase tracking-wider">Comment</label>
                <textarea 
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience with this piece..."
                  className="w-full bg-noir border border-line-2 px-3 py-2 text-sm text-cream outline-none font-light resize-none"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn solid !w-full justify-center"
                disabled={submittingReview}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
              {reviewMsg && (
                <p className="text-xs text-center text-gold mt-2">{reviewMsg}</p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProductDetails;
