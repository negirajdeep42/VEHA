import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { updateProfile, logoutUser, clearError } from '../features/auth/authSlice';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector(state => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('veha_token');
    if (!token) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    dispatch(clearError());

    if (!name.trim()) return;

    try {
      await dispatch(updateProfile({ name, phone })).unwrap();
      setMsg("Profile details updated successfully.");
    } catch (err: any) {
      setMsg(err || "Failed to update profile.");
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate('/');
    });
  };

  if (!user) return null;

  return (
    <div className="wrap sec text-left flex flex-col lg:flex-row gap-12">
      
      {/* Profile Sidebar */}
      <aside className="w-full lg:w-[260px] flex-shrink-0 space-y-6 pr-0 lg:pr-6 border-r border-line">
        <div className="space-y-1">
          <h3 className="font-display text-xl text-gold uppercase tracking-wider">{user.name}</h3>
          <p className="text-xs text-cream-soft font-light">{user.email}</p>
        </div>
        <div className="rule !mx-0"></div>
        <div className="flex flex-col gap-3">
          <Link to="/profile" className="text-sm text-gold font-medium tracking-wide">Personal Details</Link>
          <Link to="/orders" className="text-sm text-cream-soft hover:text-gold tracking-wide transition">My Purchase Orders</Link>
          <Link to="/wishlist" className="text-sm text-cream-soft hover:text-gold tracking-wide transition">Wishlist Saved Items</Link>
          <button 
            type="button" 
            onClick={handleLogout}
            className="text-left text-sm text-err hover:underline uppercase tracking-wider pt-2"
          >
            Logout session
          </button>
        </div>
      </aside>

      {/* Profile Editor */}
      <div className="flex-1 max-w-[600px] space-y-6">
        <h3 className="font-display text-2xl text-gold uppercase tracking-wider border-b border-line pb-3">Personal Details</h3>

        {error && <p className="text-sm text-err bg-err/10 border border-err/20 p-3 text-center">{error}</p>}
        {msg && <p className="text-sm text-gold bg-gold/10 border border-gold/20 p-3 text-center">{msg}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="field">
            <input 
              type="text" 
              placeholder="Your Full Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className="field">
            <input 
              type="email" 
              placeholder="Email Address" 
              value={user.email}
              disabled
              className="opacity-50 cursor-not-allowed" 
            />
            <span className="text-[10px] text-cream-dim px-4 pb-2 block -mt-2">Email address cannot be changed.</span>
          </div>
          <div className="field">
            <input 
              type="tel" 
              placeholder="Phone Number (Optional)" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn solid !py-4 !px-8 text-xs"
            disabled={loading}
          >
            {loading ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </form>
      </div>

    </div>
  );
};
export default Profile;
