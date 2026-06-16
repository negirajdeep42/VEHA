import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchProducts } from '../features/products/productSlice';
import { fetchWishlist } from '../features/wishlist/wishlistSlice';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { IMAGES } from '../utils/imageConstants';

export const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: products, loading } = useAppSelector(state => state.products);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    dispatch(fetchProducts({ page: 0, size: 4 }));
    dispatch(fetchWishlist());
  }, [dispatch]);

  // Filter featured or bestseller items
  const bestsellers = products.filter(p => p.bestseller || p.featured).slice(0, 4);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero relative flex items-center justify-center min-h-[640px] px-7">
        <div className="glow"></div>
        
        {/* Landscape high-resolution background asset */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src={IMAGES.hero.main} 
            alt="Veha Jewelry Showcase" 
            className="w-full h-full object-cover opacity-[0.45] filter brightness-75 scale-105"
            loading="eager"
          />
        </div>

        <div className="hero-inner relative z-10">
          <svg className="crown w-[62px] h-[38px] mx-auto mb-6" viewBox="0 0 100 56" aria-hidden="true">
            <path d="M16 46 L13 21 L32 34 L50 12 L68 34 L87 21 L84 46 Z"/>
            <rect x="15" y="45" width="70" height="8" rx="1" fill="url(#gd)"/>
            <circle cx="13" cy="18" r="3.2"/><circle cx="50" cy="9" r="3.6"/><circle cx="87" cy="18" r="3.2"/>
          </svg>
          <h1 className="shine font-display text-6xl md:text-8xl tracking-widest mb-2">VEHA</h1>
          <div className="tag tracking-[0.62em] uppercase text-xs text-gold-2 mb-8">Jewelry</div>
          <div className="rule"></div>
          <p className="lede font-serif italic text-2xl md:text-3xl text-cream max-w-[640px] mx-auto mb-4">
            Heirloom craft, made for the everyday.
          </p>
          <p className="text-sm text-cream-soft max-w-[500px] mx-auto mb-10 font-light tracking-wide">
            BIS-hallmarked gold and 925 sterling silver, finished by hand and kept brilliant for life.
          </p>
          <div className="hero-cta flex justify-center gap-4">
            <Link to="/shop" className="btn solid">SHOP THE COLLECTION</Link>
            <a href="#edit" className="btn line">THE VEHA STORY</a>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="sec" id="shop">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Browse</span>
            <h2 className="gold-text">Shop by category</h2>
          </div>
          <div className="cats">
            <Link to="/shop?category=rings" className="cat">
              <div className="ic">
                <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <circle cx="32" cy="38" r="18"/><path d="M24 22l8-9 8 9z"/><path d="M32 13v9"/>
                </svg>
              </div>
              <span>Rings</span>
            </Link>
            <Link to="/shop?category=earrings" className="cat">
              <div className="ic">
                <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M22 14a5 5 0 0 1 10 0c0 6-5 6-5 13"/><circle cx="27" cy="42" r="8"/>
                  <path d="M37 14a5 5 0 0 1 10 0c0 6-5 6-5 13"/><circle cx="42" cy="42" r="8"/>
                </svg>
              </div>
              <span>Earrings</span>
            </Link>
            <Link to="/shop?category=necklaces" className="cat">
              <div className="ic">
                <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M14 16c6 16 12 22 18 22s12-6 18-22"/><path d="M32 38l-4 8h8z"/><circle cx="32" cy="50" r="3"/>
                </svg>
              </div>
              <span>Necklaces</span>
            </Link>
            <Link to="/shop?category=bracelets" className="cat">
              <div className="ic">
                <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <ellipse cx="32" cy="32" rx="22" ry="14"/><ellipse cx="32" cy="32" rx="14" ry="8"/><circle cx="32" cy="18" r="3"/>
                </svg>
              </div>
              <span>Bracelets</span>
            </Link>
            <Link to="/shop" className="cat">
              <div className="ic">
                <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="13"/>
                </svg>
              </div>
              <span>All</span>
            </Link>
            <Link to="/categories" className="cat">
              <div className="ic">
                <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <ellipse cx="32" cy="30" rx="20" ry="13"/><path d="M22 42l3 6M32 43v6M42 42l-3 6"/>
                </svg>
              </div>
              <span>More</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="sec pt-0" id="bestsellers">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Loved most</span>
            <h2 className="gold-text">The Bestsellers</h2>
            <p>Hand-finished pieces our patrons return to, season after season.</p>
          </div>

          <div className="grid">
            {loading ? (
              <SkeletonLoader count={4} />
            ) : bestsellers.length > 0 ? (
              bestsellers.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="col-span-full text-center text-cream-soft py-10">No bestsellers found.</p>
            )}
          </div>
          <div className="more">
            <Link to="/shop" className="btn line">View all jewellery</Link>
          </div>
        </div>
      </section>

      {/* Trust Promise Section */}
      <section className="promise" id="promise">
        <div className="wrap">
          <div className="row">
            <div className="pr">
              <div className="ic">
                <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M18 3l4 3 5-1 1 5 4 3-3 4 1 5-5 1-3 4-4-3-4 3-3-4-5-1 1-5-3-4 4-3 1-5 5 1z"/><path d="M14 18l3 3 6-6"/>
                </svg>
              </div>
              <h4>Hallmarked</h4>
              <p>BIS-certified gold and 925 sterling silver, stamped on every piece.</p>
            </div>
            <div className="pr">
              <div className="ic">
                <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M6 12l12-6 12 6-12 6z"/><path d="M6 12v12l12 6 12-6V12"/>
                </svg>
              </div>
              <h4>Made to last</h4>
              <p>Protected finishes that resist tarnish and keep their shine.</p>
            </div>
            <div className="pr">
              <div className="ic">
                <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M5 19l5 5 9-9"/><path d="M16 24l3 3 12-12"/>
                </svg>
              </div>
              <h4>Free returns</h4>
              <p>30 days to change your mind &mdash; sent back free, no questions.</p>
            </div>
            <div className="pr">
              <div className="ic">
                <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <rect x="5" y="9" width="26" height="18" rx="2"/><path d="M5 14h26M10 22h6"/>
                </svg>
              </div>
              <h4>Pay your way</h4>
              <p>UPI, cards or cash on delivery &mdash; whatever suits you best.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Royal Edit Section */}
      <section className="sec" id="edit">
        <div className="wrap">
          <div className="edit">
            <div className="edit-art relative flex items-center justify-center">
              <div className="absolute inset-0 z-0">
                <img 
                  src={IMAGES.collections.royalEdit} 
                  alt="Royal Edit Collection cover" 
                  className="w-full h-full object-cover opacity-60"
                  loading="lazy"
                />
              </div>
              <div className="frame z-10"></div>
              {/* Optional overlay fallback vectors */}
              <svg className="render z-10 relative !w-1/2 !h-1/2" viewBox="0 0 200 200" aria-hidden="true">
                <ellipse cx="100" cy="186" rx="30" ry="6" fill="#000" opacity="0.4" filter="url(#soft)"/>
                <path d="M30,40 Q100,160 170,40" fill="none" stroke="url(#gold-h)" strokeWidth="6" strokeLinecap="round"/>
                <path d="M30,40 Q100,160 170,40" fill="none" stroke="#FFF6D8" strokeWidth="1.6" strokeLinecap="round" opacity="0.45"/>
                <circle cx="100" cy="128" r="7" fill="none" stroke="url(#gold-h)" strokeWidth="3.5"/>
                <path d="M100,138 C80,154 80,182 100,194 C120,182 120,154 100,138 Z" fill="url(#gold-h)"/>
                <path d="M100,147 C86,159 86,178 100,186 C114,178 114,159 100,147 Z" fill="url(#diamond)"/>
                <path d="M91,160 C88,167 88,174 93,180" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity="0.55"/>
                <g className="spark"><line x1="100" y1="156" x2="100" y2="172" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/><line x1="92" y1="164" x2="108" y2="164" stroke="#fff" stroke-width="1.6" strokeLinecap="round"/></g>
              </svg>
            </div>
            <div className="edit-txt">
              <span className="eyebrow">New collection</span>
              <h2 className="gold-text">The Royal Edit</h2>
              <p>A curated capsule of statement pieces &mdash; fine chains, signet rings and chandelier drops crafted to be noticed, then treasured. Opulence, worn lightly.</p>
              <Link to="/shop" className="btn solid">Discover the edit</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Kind words</span>
            <h2 className="gold-text">Loved by 12,000+ patrons</h2>
          </div>
          <div className="rev-grid">
            <div className="rev">
              <div className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <q>The gold has a real depth to it &mdash; far richer than the price suggests. It hasn't dulled at all.</q>
              <span className="who">Ananya R. &middot; Mumbai</span>
            </div>
            <div className="rev">
              <div className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <q>Bought the wave cuff as a gift and the packaging alone felt like a luxury house. She adores it.</q>
              <span className="who">Karan M. &middot; Bengaluru</span>
            </div>
            <div className="rev">
              <div className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
              <q>Exactly as pictured, delivered in two days. The hallmark gave me total confidence buying online.</q>
              <span className="who">Priya S. &middot; Delhi</span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="news">
        <svg className="crown w-[46px] h-[28px] mx-auto mb-6" viewBox="0 0 100 56" aria-hidden="true">
          <path d="M16 46 L13 21 L32 34 L50 12 L68 34 L87 21 L84 46 Z"/>
          <rect x="15" y="45" width="70" height="8" rx="1" fill="url(#gd)"/>
          <circle cx="13" cy="18" r="3.2"/><circle cx="50" cy="9" r="3.6"/><circle cx="87" cy="18" r="3.2"/>
        </svg>
        <h2 className="gold-text">Join the Veha circle</h2>
        <p>Early access to new drops, styling notes and 10% off your first order.</p>
        <form onSubmit={handleSubscribe} className="news-form">
          <input 
            type="email" 
            placeholder="Your email address" 
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={subscribed}
            required
          />
          <button type="submit" disabled={subscribed}>
            {subscribed ? 'Welcome ✦' : 'Subscribe'}
          </button>
        </form>
      </section>
    </div>
  );
};
export default Home;
