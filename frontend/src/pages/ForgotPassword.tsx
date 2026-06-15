import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { VehaApi } from '../utils/api';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await VehaApi.forgotPassword(email);
      setMsg(res.message || "Reset link generated. In developer mode, grab the token from console logs.");
      
      // Developer helper prompt to jump straight to reset screen
      const tokenPrompt = prompt("In local development mode, you can copy the token from the Spring Boot console output and paste it here to reset immediately:");
      if (tokenPrompt) {
        window.location.href = `/reset-password?token=${encodeURIComponent(tokenPrompt)}`;
      }
    } catch (err: any) {
      setError(err.message || "Request failed. Verify email is correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap sec flex justify-center items-center min-h-[500px]">
      <div className="w-full max-w-[420px] bg-noir-2 border border-line p-8 space-y-6 text-left">
        
        <div className="text-center space-y-2">
          <h2 className="font-display text-2xl text-gold uppercase tracking-wider">Forgot Password</h2>
          <p className="text-xs text-cream-soft font-light">Enter email to recover your account credentials.</p>
        </div>

        {error && <p className="text-xs text-err bg-err/10 border border-err/20 p-3 text-center">{error}</p>}
        {msg && <p className="text-xs text-gold bg-gold/10 border border-gold/20 p-3 text-center">{msg}</p>}

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

          <button 
            type="submit" 
            className="btn solid !w-full justify-center !py-4"
            disabled={loading}
          >
            {loading ? 'Sending Request...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="text-center text-xs font-light text-cream-soft border-t border-line pt-4">
          Back to{' '}
          <Link to="/login" className="text-gold hover:underline font-medium">Login</Link>
        </div>

      </div>
    </div>
  );
};
export default ForgotPassword;
