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
      <header>
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

          <nav>
            <ul className={`menu ${mobileMenuOpen ? '!flex flex-col absolute top-[128px] left-0 w-full bg-noir border-b border-line p-6 gap-4 z-40' : ''}`}>
              <li><Link to="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</Link></li>
              <li><Link to="/shop?sort=bestseller" onClick={() => setMobileMenuOpen(false)}>Bestsellers</Link></li>
              <li><Link to="/categories" onClick={() => setMobileMenuOpen(false)}>Collections</Link></li>
              <li><Link to="/about" onClick={() => setMobileMenuOpen(false)}>The House</Link></li>
              <li><Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link></li>
              {mobileMenuOpen && user && (
                <li>
                  <button 
                    onClick={() => {
                      dispatch(logoutUser());
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="text-left text-xs uppercase tracking-widest text-gold-d"
                  >
                    Logout ({user.name})
                  </button>
                </li>
              )}
            </ul>
          </nav>

          <div className="icons">
            <Link to="/track-order" aria-label="Search" className="lg">
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
            <Link to="/cart" className="cart-ic" aria-label="Cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 8h12l-1.2 11.2A2 2 0 0 1 14.8 21H9.2A2 2 0 0 1 7.2 19.2L6 8Z"/>
                <path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>
              </svg>
              <span className="cart-count" id="cartCount">{cartSummary.count}</span>
            </Link>
            <button 
              className="burger" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 7h16M4 12h16M4 17h16"/>
              </svg>
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
export default Header;
