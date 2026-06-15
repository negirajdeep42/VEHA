import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { loginUser, clearError } from '../features/auth/authSlice';
import { mergeGuestCart } from '../features/cart/cartSlice';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  
  const { loading, error, user } = useAppSelector(state => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirect = searchParams.get('redirect') || '/profile';

  useEffect(() => {
    // If already logged in, redirect
    if (user) {
      navigate(redirect);
    }
    return () => {
      dispatch(clearError());
    };
  }, [user, navigate, redirect, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    try {
      const res = await dispatch(loginUser({ email, password })).unwrap();
      if (res.token) {
        // Sync cart and wishlist
        await dispatch(mergeGuestCart());
        // Wait, the thunk name in wishlistSlice is mergeWishlist
        const { mergeWishlist } = await import('../features/wishlist/wishlistSlice');
        await dispatch(mergeWishlist());
        
        navigate(redirect);
      }
    } catch (err) {
      // Handled by Redux state
    }
  };

  return (
    <div className="wrap sec flex justify-center items-center min-h-[500px]">
      <div className="w-full max-w-[420px] bg-noir-2 border border-line p-8 space-y-6 text-left">
        
        <div className="text-center space-y-2">
          <svg className="crown w-[38px] h-[24px] mx-auto" viewBox="0 0 100 56" aria-hidden="true">
            <path d="M16 46 L13 21 L32 34 L50 12 L68 34 L87 21 L84 46 Z"/>
            <rect x="15" y="45" width="70" height="8" rx="1" fill="url(#gd)"/>
            <circle cx="13" cy="18" r="3.2"/><circle cx="50" cy="9" r="3.6"/><circle cx="87" cy="18" r="3.2"/>
          </svg>
          <h2 className="font-display text-2xl text-gold uppercase tracking-wider">Login</h2>
          <p className="text-xs text-cream-soft font-light">Access your profile and track order history.</p>
        </div>

        {error && (
          <p className="text-xs text-err bg-err/10 border border-err/20 p-3 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="field">
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="field">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn solid !w-full justify-center !py-4"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="flex justify-between items-center text-xs font-light text-cream-soft border-t border-line pt-4">
          <Link to="/forgot-password" className="hover:text-gold hover:underline">Forgot Password?</Link>
          <div>
            Don't have an account?{' '}
            <Link to="/register" className="text-gold hover:underline font-medium">Register</Link>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Login;
