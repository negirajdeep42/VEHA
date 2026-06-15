import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VehaApi } from '../utils/api';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await VehaApi.register(name, email, phone, password);
      setSuccess(res.message || "Registration successful! Please verify your email to login.");
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err: any) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap sec flex justify-center items-center min-h-[550px]">
      <div className="w-full max-w-[420px] bg-noir-2 border border-line p-8 space-y-6 text-left">
        
        <div className="text-center space-y-2">
          <svg className="crown w-[38px] h-[24px] mx-auto" viewBox="0 0 100 56" aria-hidden="true">
            <path d="M16 46 L13 21 L32 34 L50 12 L68 34 L87 21 L84 46 Z"/>
            <rect x="15" y="45" width="70" height="8" rx="1" fill="url(#gd)"/>
            <circle cx="13" cy="18" r="3.2"/><circle cx="50" cy="9" r="3.6"/><circle cx="87" cy="18" r="3.2"/>
          </svg>
          <h2 className="font-display text-2xl text-gold uppercase tracking-wider">Register</h2>
          <p className="text-xs text-cream-soft font-light">Create an account to save wishlist and checkout securely.</p>
        </div>

        {error && (
          <p className="text-xs text-err bg-err/10 border border-err/20 p-3 text-center">{error}</p>
        )}

        {success && (
          <p className="text-xs text-gold bg-gold/10 border border-gold/20 p-3 text-center">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="field">
            <input 
              type="text" 
              placeholder="Full Name *" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className="field">
            <input 
              type="email" 
              placeholder="Email Address *" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="field">
            <input 
              type="tel" 
              placeholder="Phone Number (Optional)" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="field">
            <input 
              type="password" 
              placeholder="Password *" 
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="text-center text-xs font-light text-cream-soft border-t border-line pt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-gold hover:underline font-medium">Login</Link>
        </div>

      </div>
    </div>
  );
};
export default Register;
