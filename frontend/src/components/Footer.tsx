import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer>
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <Link className="brand" to="/">
              <svg className="crown" viewBox="0 0 100 56" style={{ width: '26px', height: '16px' }} aria-hidden="true">
                <path d="M16 46 L13 21 L32 34 L50 12 L68 34 L87 21 L84 46 Z"/>
                <rect x="15" y="45" width="70" height="8" rx="1" fill="url(#gd)"/>
                <circle cx="13" cy="18" r="3.2"/><circle cx="50" cy="9" r="3.6"/><circle cx="87" cy="18" r="3.2"/>
              </svg>
              <span className="nm gold-text">VEHA</span>
              <span className="sub">Jewelry</span>
            </Link>
            <p>Hallmarked gold and sterling silver jewellery, finished by hand and made to be lived in.</p>
            <div className="social">
              <a href="#" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1"/>
                </svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8a1 1 0 0 1 1-1z"/>
                </svg>
              </a>
              <a href="#" aria-label="Pinterest">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3a9 9 0 0 0-3 17.5c-.2-1.3-.3-3 .1-4.4l1.4-5.9s-.4-.7-.4-1.8c0-1.7 1-3 2.2-3 1 0 1.5.8 1.5 1.7 0 1-.7 2.6-1 4 0 1.1.8 2 1.9 2 2.3 0 3.8-2.9 3.8-6.3 0-2.6-1.8-4.5-5-4.5"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="fcol">
            <h5>Shop</h5>
            <Link to="/shop?category=rings">Rings</Link>
            <Link to="/shop?category=earrings">Earrings</Link>
            <Link to="/shop?category=necklaces">Necklaces</Link>
            <Link to="/shop?category=bracelets">Bracelets</Link>
            <Link to="/shop">New in</Link>
          </div>
          <div className="fcol">
            <h5>The House</h5>
            <Link to="/about">Our story</Link>
            <Link to="/about">Journal</Link>
            <Link to="/about">Craftsmanship</Link>
            <Link to="/about">Stores</Link>
          </div>
          <div className="fcol">
            <h5>Service</h5>
            <Link to="/track-order">Track order</Link>
            <Link to="/contact">Shipping</Link>
            <Link to="/contact">Returns</Link>
            <Link to="/contact">Jewellery care</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        <div className="foot-bot">
          <small>&copy; {new Date().getFullYear()} Veha Jewelry. All rights reserved.</small>
          <div className="pays">
            <span>UPI</span>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
