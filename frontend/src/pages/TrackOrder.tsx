import React, { useState } from 'react';
import { VehaApi } from '../utils/api';
import { Order } from '../types';

export const TrackOrder: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);

    const idVal = parseInt(orderId.trim());
    if (isNaN(idVal)) {
      setError("Please enter a valid numeric Order ID.");
      return;
    }

    setLoading(true);
    try {
      // Fetch details privately/publicly (needs to be authenticated but let's query detail)
      const data = await VehaApi.getOrderDetails(idVal);
      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Order not found. Note: you must be logged in as the owner to track.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap sec text-left space-y-8 max-w-[800px] mx-auto">
      <div className="sec-head !text-center">
        <span className="eyebrow">House Logistics</span>
        <h2 className="gold-text">Track Your Order</h2>
      </div>

      <div className="bg-noir-2 border border-line p-6 space-y-6">
        <form onSubmit={handleTrackSubmit} className="space-y-4">
          <div className="field">
            <input 
              type="text" 
              placeholder="Enter Numeric Order ID (e.g. 1)" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn solid !w-full justify-center !py-4" disabled={loading}>
            {loading ? 'Tracking...' : 'Lookup Shipping Status'}
          </button>
        </form>

        {error && <p className="text-xs text-err text-center bg-err/10 border border-err/20 p-3">{error}</p>}

        {order && (
          <div className="border border-line p-6 bg-noir space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <h4 className="font-display text-base text-gold uppercase tracking-wider">Order #{order.id}</h4>
              <span className={`text-[10px] font-semibold tracking-wider px-3 py-0.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-400' : 'bg-gold/10 text-gold'}`}>
                {order.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-light">
              <div className="space-y-2">
                <p><span className="text-cream-soft">Order Date:</span> {new Date(order.orderDate).toLocaleDateString()}</p>
                <p><span className="text-cream-soft">Payment Method:</span> <span className="uppercase">{order.paymentGateway}</span></p>
                <p><span className="text-cream-soft">Payment Status:</span> <span className="uppercase text-xs font-medium text-green-400">{order.paymentStatus}</span></p>
              </div>
              <div className="space-y-2">
                <p><span className="text-cream-soft">Deliver to:</span></p>
                <p className="text-xs text-cream-soft font-light leading-relaxed pl-2 border-l border-line">
                  {order.shippingAddressLine}<br />
                  {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
                </p>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="bg-noir-2 p-4 border border-line flex items-center justify-between text-xs">
                <span className="text-cream-soft">LOGISTICS PARTNER TRACKING ID</span>
                <span className="font-mono text-gold font-medium">{order.trackingNumber}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default TrackOrder;
