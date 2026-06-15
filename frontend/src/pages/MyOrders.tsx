import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchOrders } from '../features/orders/orderSlice';

export const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { orders, loading, error } = useAppSelector(state => state.orders);
  const { user } = useAppSelector(state => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('veha_token');
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(fetchOrders());
  }, [dispatch, navigate]);

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
          <Link to="/profile" className="text-sm text-cream-soft hover:text-gold tracking-wide transition">Personal Details</Link>
          <Link to="/orders" className="text-sm text-gold font-medium tracking-wide">My Purchase Orders</Link>
          <Link to="/wishlist" className="text-sm text-cream-soft hover:text-gold tracking-wide transition">Wishlist Saved Items</Link>
        </div>
      </aside>

      {/* Orders List */}
      <div className="flex-1 space-y-6">
        <h3 className="font-display text-2xl text-gold uppercase tracking-wider border-b border-line pb-3">My Orders</h3>

        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin inline-block w-6 h-6 border-4 border-gold border-t-transparent rounded-full" />
            <p className="mt-2 text-xs text-cream-soft font-light">Loading orders history...</p>
          </div>
        )}

        {error && <p className="text-sm text-err bg-err/10 border border-err/20 p-3 text-center">{error}</p>}

        {!loading && orders.length === 0 ? (
          <div className="border border-dashed border-line p-8 text-center">
            <p className="text-cream-soft font-light mb-4">You haven't placed any orders yet.</p>
            <Link to="/shop" className="btn solid">Browse collection</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-line text-sm text-left">
              <thead className="bg-noir-2 border-b border-line text-xs uppercase tracking-wider text-gold font-display">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line font-light">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-noir-2/30 transition">
                    <td className="p-4 font-mono font-medium">#{order.id}</td>
                    <td className="p-4 text-cream-soft">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="p-4 text-xs font-medium uppercase tracking-wider text-cream-soft">{order.paymentGateway}</td>
                    <td className="p-4">
                      <span className={`text-[10px] uppercase font-medium tracking-wider px-2.5 py-0.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-400' : order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-400' : 'bg-gold/10 text-gold'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right">
                      <Link to={`/orders/${order.id}`} className="text-xs text-gold hover:underline uppercase tracking-wider font-medium">Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
export default MyOrders;
