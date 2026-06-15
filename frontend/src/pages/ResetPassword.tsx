import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { VehaApi } from '../utils/api';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (!token.trim() || !newPassword.trim()) {
      setError("Token and Password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await VehaApi.resetPassword(token, newPassword);
      setMsg(res.message || "Password reset successful! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Reset failed. Expired token.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap sec flex justify-center items-center min-h-[500px]">
      <div className="w-full max-w-[420px] bg-noir-2 border border-line p-8 space-y-6 text-left">
        
        <div className="text-center space-y-2">
          <h2 className="font-display text-2xl text-gold uppercase tracking-wider">Reset Password</h2>
          <p className="text-xs text-cream-soft font-light">Set your new password to regain access.</p>
        </div>

        {error && <p className="text-xs text-err bg-err/10 border border-err/20 p-3 text-center">{error}</p>}
        {msg && <p className="text-xs text-gold bg-gold/10 border border-gold/20 p-3 text-center">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="field">
            <input 
              type="text" 
              placeholder="Reset Token" 
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required 
            />
          </div>
          <div className="field">
            <input 
              type="password" 
              placeholder="New Password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn solid !w-full justify-center !py-4"
            disabled={loading}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
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
export default ResetPassword;
