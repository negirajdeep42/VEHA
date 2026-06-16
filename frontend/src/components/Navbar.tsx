import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/store';
import { logoutUser } from '../features/auth/authSlice';
import { selectCartSummary } from '../features/cart/cartSlice';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user } = useAppSelector(state => state.auth);
  const cartSummary = useAppSelector(selectCartSummary);
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  
  const [annIndex, setAnnIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const announcements = [
    "30-DAY EASY RETURNS",
    "COMPLIMENTARY SHIPPING OVER ₹999",
    "BIS-HALLMARKED GOLD & 925 SILVER",
    "LIFETIME POLISH & CARE"
  ];

  // Announcement bar rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setAnnIndex(prev => (prev + 1) % announcements.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Track window scroll to toggle background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-close menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Auto-close menu on resize if screen becomes desktop width (>= 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent scrolling when mobile menu is open (without layout shifts)
  useEffect(() => {
    if (mobileMenuOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close search modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check if a path is active (supports search/query param mapping)
  const isLinkActive = (path: string) => {
    if (path === '/shop') {
      return location.pathname === '/shop' && !location.search.includes('featured=bestseller');
    }
    return location.pathname + location.search === path;
  };

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate('/');
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchModalOpen(false);
      navigate(`/shop?search=${encodeURIComponent(searchInput.trim())}`);
      setSearchInput('');
    }
  };

  const activeClass = "active-link text-gold";
  const inactiveClass = "text-cream hover:text-gold";

  return (
    <>
      {/* SVG definitions for Gold Gradient */}
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

      {/* Announcement Bar */}
      <div className="announce w-full" aria-label="Store highlights">
        <div 
          className="announce-track" 
          style={{ transform: `translateX(-${annIndex * 100}%)` }}
        >
          {announcements.map((ann, idx) => (
            <span key={idx}>{ann}</span>
          ))}
        </div>
      </div>

      {/* Header Container */}
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-noir/95 backdrop-blur-md border-b border-gold/15 shadow-lg h-[80px]' 
            : 'bg-transparent border-b border-transparent h-[88px]'
        }`}
      >
        <div className="wrap nav h-full relative navbar w-full">
          
          {/* LEFT SECTION (Logo on Desktop) */}
          <div className="logo-section hidden lg:flex items-center justify-start flex-1">
            <Link className="brand flex flex-col items-center justify-center text-center" to="/" aria-label="Veha Jewelry home">
              <svg className="crown w-[30px] h-[18px] mb-[3px]" viewBox="0 0 100 56" aria-hidden="true">
                <path d="M16 46 L13 21 L32 34 L50 12 L68 34 L87 21 L84 46 Z"/>
                <rect x="15" y="45" width="70" height="8" rx="1" fill="url(#gd)"/>
                <circle cx="13" cy="18" r="3.2"/><circle cx="50" cy="9" r="3.6"/><circle cx="87" cy="18" r="3.2"/>
              </svg>
              <span className="nm gold-text text-[26px] font-semibold tracking-[0.22em] pl-[0.22em] leading-none">VEHA</span>
              <span className="sub text-[8px] font-normal tracking-[0.5em] text-gold-d mt-[3px] pl-[0.5em] uppercase leading-none">JEWELRY</span>
            </Link>
          </div>

          {/* CENTER SECTION (Navigation Links on Desktop) */}
          <nav className="navigation-links hidden lg:flex justify-center flex-1">
            <ul className="menu">
              <li>
                <Link 
                  to="/shop" 
                  className={`nav-link transition-colors duration-300 ${isLinkActive('/shop') ? activeClass : inactiveClass}`}
                >
                  SHOP
                </Link>
              </li>
              <li>
                <Link 
                  to="/shop?featured=bestseller" 
                  className={`nav-link transition-colors duration-300 ${isLinkActive('/shop?featured=bestseller') ? activeClass : inactiveClass}`}
                >
                  BESTSELLERS
                </Link>
              </li>
              <li>
                <Link 
                  to="/collections" 
                  className={`nav-link transition-colors duration-300 ${isLinkActive('/collections') ? activeClass : inactiveClass}`}
                >
                  COLLECTIONS
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`nav-link transition-colors duration-300 ${isLinkActive('/about') ? activeClass : inactiveClass}`}
                >
                  THE HOUSE
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className={`nav-link transition-colors duration-300 ${isLinkActive('/contact') ? activeClass : inactiveClass}`}
                >
                  CONTACT
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile/Tablet Logo centered absolutely (visible below lg) */}
          <div className="lg:hidden absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <Link className="brand flex flex-col items-center justify-center text-center" to="/" aria-label="Veha Jewelry home">
              <svg className="crown w-[30px] h-[18px] mb-[3px]" viewBox="0 0 100 56" aria-hidden="true">
                <path d="M16 46 L13 21 L32 34 L50 12 L68 34 L87 21 L84 46 Z"/>
                <rect x="15" y="45" width="70" height="8" rx="1" fill="url(#gd)"/>
                <circle cx="13" cy="18" r="3.2"/><circle cx="50" cy="9" r="3.6"/><circle cx="87" cy="18" r="3.2"/>
              </svg>
              <span className="nm gold-text text-[26px] font-semibold tracking-[0.22em] pl-[0.22em] leading-none">VEHA</span>
              <span className="sub text-[8px] font-normal tracking-[0.5em] text-gold-d mt-[3px] pl-[0.5em] uppercase leading-none">JEWELRY</span>
            </Link>
          </div>

          {/* RIGHT SECTION (Action Icons on Desktop, Action Icons + Hamburger on Mobile/Tablet) */}
          <div className="icons flex-grow justify-end ml-auto lg:ml-0 flex-1">
            <button 
              onClick={() => setSearchModalOpen(true)} 
              aria-label="Search" 
              className="hover:text-gold transition-colors duration-300 cursor-pointer text-cream"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>
            <Link to={user ? "/profile" : "/login"} aria-label="Account" className="hover:text-gold transition-colors duration-300 text-cream">
              <User className="w-[18px] h-[18px]" />
            </Link>
            <Link to="/wishlist" aria-label="Wishlist" className="relative hover:text-gold transition-colors duration-300 text-cream">
              <Heart className="w-[18px] h-[18px]" />
              {wishlistItems.length > 0 && (
                <span className="cart-count bg-gold text-noir text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center absolute -top-1.5 -right-1.5">{wishlistItems.length}</span>
              )}
            </Link>
            <Link to="/cart" className="cart-ic relative hover:text-gold transition-colors duration-300 text-cream" aria-label="Cart">
              <ShoppingBag className="w-[18px] h-[18px]" />
              <span className="cart-count bg-gold text-noir text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center absolute -top-1.5 -right-1.5" id="cartCount">{cartSummary.count}</span>
            </Link>
            {/* Hamburger Menu Icon (hidden on lg desktop) */}
            <button 
              className="burger lg:hidden flex flex-col justify-center items-center cursor-pointer text-cream hover:text-gold transition-colors duration-300"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-[18px] h-[18px]" />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      <div 
        className={`mobile-menu-backdrop lg:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'}`} 
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Right Drawer Panel (300ms animation duration configured in CSS) */}
      <div 
        className={`mobile-menu-drawer lg:hidden ${mobileMenuOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'}`}
      >
        <div className="flex flex-col">
          {/* Header of Drawer */}
          <div className="flex justify-between items-center pb-6 border-b border-line mb-8">
            <span className="eyebrow !text-gold">Navigation</span>
            <button 
              className="text-cream hover:text-gold transition-colors p-1 cursor-pointer" 
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links list */}
          <nav className="flex flex-col gap-6">
            <Link 
              to="/shop" 
              className={`text-[14px] tracking-[0.18em] uppercase transition-colors duration-300 ${isLinkActive('/shop') ? activeClass : inactiveClass}`}
            >
              Shop
            </Link>
            <Link 
              to="/shop?featured=bestseller" 
              className={`text-[14px] tracking-[0.18em] uppercase transition-colors duration-300 ${isLinkActive('/shop?featured=bestseller') ? activeClass : inactiveClass}`}
            >
              Bestsellers
            </Link>
            <Link 
              to="/collections" 
              className={`text-[14px] tracking-[0.18em] uppercase transition-colors duration-300 ${isLinkActive('/collections') ? activeClass : inactiveClass}`}
            >
              Collections
            </Link>
            <Link 
              to="/about" 
              className={`text-[14px] tracking-[0.18em] uppercase transition-colors duration-300 ${isLinkActive('/about') ? activeClass : inactiveClass}`}
            >
              The House
            </Link>
            <Link 
              to="/contact" 
              className={`text-[14px] tracking-[0.18em] uppercase transition-colors duration-300 ${isLinkActive('/contact') ? activeClass : inactiveClass}`}
            >
              Contact
            </Link>
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
                <Link to="/profile" className="text-[11px] uppercase tracking-wider text-cream hover:text-gold transition-colors">My Profile</Link>
                <button 
                  onClick={handleLogout}
                  className="text-[11px] uppercase tracking-wider text-err hover:opacity-80 transition-opacity cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" className="btn line !py-3 !text-[10px] text-center w-full justify-center">Login</Link>
              <Link to="/register" className="btn solid !py-3 !text-[10px] text-center w-full justify-center">Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* Search Modal Overlay */}
      <div 
        className={`fixed inset-0 bg-black/95 backdrop-blur-md z-[200] transition-all duration-300 flex flex-col items-center justify-center p-6 ${
          searchModalOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
      >
        <button 
          className="absolute top-6 right-6 text-cream hover:text-gold transition-colors p-2 cursor-pointer"
          onClick={() => setSearchModalOpen(false)}
          aria-label="Close search"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-full max-w-[600px] text-center space-y-6">
          <h2 className="font-display text-2xl text-gold uppercase tracking-widest">Search VEHA</h2>
          <form onSubmit={handleSearchSubmit} className="relative border-b border-gold/40 pb-2 flex items-center">
            <input 
              type="text" 
              placeholder="What are you looking for?"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-transparent border-none outline-none text-xl text-cream placeholder-cream-dim w-full font-light tracking-wide text-center"
              autoFocus={searchModalOpen}
            />
            <button type="submit" className="absolute right-0 text-cream hover:text-gold transition-colors cursor-pointer">
              <Search className="w-5 h-5" />
            </button>
          </form>
          <p className="text-xs text-cream-soft uppercase tracking-widest">Press Enter to search or ESC to close</p>
        </div>
      </div>
    </>
  );
};

export default Navbar;
