import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/store';
import { logoutUser } from '../features/auth/authSlice';
import { selectCartSummary } from '../features/cart/cartSlice';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const cartSummary = useAppSelector(selectCartSummary);
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  
  const [annIndex, setAnnIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const announcements = [
    "Complimentary shipping over ₹999",
    "BIS-hallmarked gold & 925 silver",
    "30-day easy returns",
    "Lifetime polish & care"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnIndex(prev => (prev + 1) % announcements.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Lock scroll on iOS/Mobile when mobile menu is open to prevent double scroll bouncing
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* SVGs definitions */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F8EAB8" />
            <stop offset=".45" stopColor="#D9B85C" />
            <stop offset=".72" stopColor="#B98E36" />
            <stop offset="1" stopColor="#8E6A22" />
          </linearGradient>
        </defs>
      </svg>

      {/* Announcement bar */}
      <div className="announce" aria-label="Store highlights">
        <div 
          className="announce-track" 
          style={{ transform: `translateX(-${annIndex * 100}%)` }}
        >
          {announcements.map((ann, idx) => (
            <span key={idx}>{ann}</span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-nav">
        <div className="wrap nav">
          <Link className="brand" to="/" aria-label="Veha Jewelry home">
            <svg className="crown" viewBox="0 0 100 56" aria-hidden="true">
              <path d="M16 46 L13 21 L32 34 L50 12 L68 34 L87 21 L84 46 Z"/>
              <rect x="15" y="45" width="70" height="8" rx="1" fill="url(#gd)"/>
              <circle cx="13" cy="18" r="3.2"/><circle cx="50" cy="9" r="3.6"/><circle cx="87" cy="18" r="3.2"/>
            </svg>
            <span className="nm gold-text">VEHA</span>
            <span className="sub">Jewelry</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="menu">
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/shop?sort=bestseller">Bestsellers</Link></li>
              <li><Link to="/categories">Collections</Link></li>
              <li><Link to="/about">The House</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </nav>

          <div className="icons">
            <Link to="/track-order" aria-label="Search" className="hidden sm:flex">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
              </svg>
            </Link>
            <Link to={user ? "/profile" : "/login"} aria-label="Account">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </Link>
            <Link to="/wishlist" aria-label="Wishlist" className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 20s-7-4.4-9.3-9C1 7.7 3 4.5 6.2 4.5c2 0 3.3 1.2 4.1 2.4l1.7 2 1.7-2c.8-1.2 2.1-2.4 4.1-2.4 3.2 0 5.2 3.2 3.5 6.5C19 15.6 12 20 12 20Z"/>
              </svg>
              {wishlistItems.length > 0 && (
                <span className="cart-count !bg-gold-d !text-noir">{wishlistItems.length}</span>
              )}
            </Link>
            <Link to="/cart" className="cart-ic relative" aria-label="Cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 8h12l-1.2 11.2A2 2 0 0 1 14.8 21H9.2A2 2 0 0 1 7.2 19.2L6 8Z"/>
                <path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>
              </svg>
              <span className="cart-count" id="cartCount">{cartSummary.count}</span>
            </Link>

            {/* Mobile Hamburger Button with CSS Line Animation */}
            <button 
              className="burger md:hidden flex flex-col justify-between w-6 h-[15px] relative focus:outline-none z-50 cursor-pointer" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <span className={`w-full h-[1.5px] bg-cream transition-all duration-300 origin-center ${mobileMenuOpen ? 'rotate-45 translate-y-[6.75px] bg-gold' : ''}`} />
              <span className={`w-full h-[1.5px] bg-cream transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-full h-[1.5px] bg-cream transition-all duration-300 origin-center ${mobileMenuOpen ? '-rotate-45 -translate-y-[6.75px] bg-gold' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      {/* Backdrop (Blur & Dim overlay) */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 z-40 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Slide-out Drawer Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[295px] max-w-[85vw] bg-noir-2 border-l border-line p-8 flex flex-col justify-between z-45 transform transition-transform duration-300 ease-out mobile-menu-drawer ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col">
          {/* Header of Drawer */}
          <div className="flex justify-between items-center pb-6 border-b border-line mb-8">
            <span className="eyebrow !text-gold">Navigation</span>
            <button 
              className="text-cream hover:text-gold transition-colors p-1" 
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Links list */}
          <nav className="flex flex-col gap-6">
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="text-[14px] tracking-[0.18em] uppercase hover:text-gold transition-colors">Shop</Link>
            <Link to="/shop?sort=bestseller" onClick={() => setMobileMenuOpen(false)} className="text-[14px] tracking-[0.18em] uppercase hover:text-gold transition-colors">Bestsellers</Link>
            <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className="text-[14px] tracking-[0.18em] uppercase hover:text-gold transition-colors">Collections</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-[14px] tracking-[0.18em] uppercase hover:text-gold transition-colors">The House</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-[14px] tracking-[0.18em] uppercase hover:text-gold transition-colors">Contact</Link>
            <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} className="text-[14px] tracking-[0.18em] uppercase hover:text-gold transition-colors sm:hidden">Track Order</Link>
          </nav>
        </div>

        {/* Footer of Drawer */}
        <div className="flex flex-col gap-4 border-t border-line pt-6">
          {user ? (
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-wider text-cream-soft">
                Signed in as <span className="text-gold font-normal block mt-1">{user.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-[11px] uppercase tracking-wider text-cream hover:text-gold transition-colors">My Profile</Link>
                <button 
                  onClick={() => {
                    dispatch(logoutUser());
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="text-[11px] uppercase tracking-wider text-err hover:opacity-80 transition-opacity"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn line !py-3 !text-[10px] text-center w-full justify-center">Login</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn solid !py-3 !text-[10px] text-center w-full justify-center">Register</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default Header;

