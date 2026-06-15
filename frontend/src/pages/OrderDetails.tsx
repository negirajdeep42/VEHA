import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchOrderDetails } from '../features/orders/orderSlice';

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedOrder: order, loading, error } = useAppSelector(state => state.orders);
  const { user } = useAppSelector(state => state.auth);
  
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('veha_token');
    if (!token) {
      navigate('/login');
      return;
    }
    if (id) {
      dispatch(fetchOrderDetails(parseInt(id)));
    }
  }, [id, dispatch, navigate]);

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const token = localStorage.getItem('veha_token');
      const response = await fetch(`http://localhost:8080/api/orders/${order.id}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `veha_invoice_${order.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to download PDF invoice.");
      }
    } catch (e) {
      console.error("Invoice fetch error:", e);
      alert("Error occurred downloading invoice.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading && !order) {
    return (
      <div className="wrap sec text-center py-20">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
        <p className="mt-4 text-cream-soft font-light">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="wrap sec text-center py-20 space-y-4">
        <h3 className="font-display text-2xl text-gold">Order Not Found</h3>
        <p className="text-cream-soft font-light">We couldn't retrieve the details for this order.</p>
        <Link to="/orders" className="btn line">Return to My Orders</Link>
      </div>
    );
  }

  return (
    <div className="wrap sec text-left space-y-8">
      
      {/* Breadcrumbs */}
      <nav className="text-xs tracking-wider uppercase text-cream-dim flex gap-2">
        <Link to="/profile" className="hover:text-gold">Profile</Link>
        <span>/</span>
        <Link to="/orders" className="hover:text-gold">Orders</Link>
        <span>/</span>
        <span className="text-gold">Order #{order.id}</span>
      </nav>

      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <h2 className="font-display text-3xl text-gold">Order Details</h2>
          <p className="text-xs text-cream-soft font-light mt-1">
            Placed on {new Date(order.orderDate).toLocaleString()} &bull; Payment Method: <span className="uppercase text-gold font-medium">{order.paymentGateway}</span>
          </p>
        </div>

        <button 
          onClick={handleDownloadInvoice}
          disabled={downloading}
          className="btn solid !py-3 !px-6 text-xs self-start sm:self-auto"
        >
          {downloading ? 'Downloading...' : 'Download Invoice PDF'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left column: Order items */}
        <div className="flex-1 space-y-6">
          <h3 className="font-display text-lg text-gold border-b border-line pb-2 uppercase tracking-wider">Purchase Items</h3>
          
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between border border-line p-4 bg-noir-2">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-radial-gradient border border-line flex items-center justify-center">
                    {item.svgRender ? (
                      <div dangerouslySetInnerHTML={{ __html: item.svgRender }} className="w-4/5 h-4/5 opacity-75" />
                    ) : (
                      <span className="text-[9px] uppercase text-gold">item</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-display text-base text-gold">{item.productName}</h4>
                    <p className="text-xs text-cream-soft font-light uppercase tracking-wider">{item.variantInfo}</p>
                    <p className="text-xs text-cream-dim font-light mt-1">
                      ₹{item.priceEach.toLocaleString('en-IN')} x {item.quantity}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-cream">₹{item.priceTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Delivery, Summary, Status */}
        <div className="w-full lg:w-[400px] space-y-8">
          
          {/* Status & Tracking */}
          <div className="bg-noir-2 border border-line p-6 space-y-4">
            <h4 className="font-display text-base text-gold uppercase tracking-wider">Order Status</h4>
            <div className="flex justify-between items-center text-sm font-light">
              <span className="text-cream-soft">Status</span>
              <span className="font-medium text-gold">{order.status}</span>
            </div>
            {order.trackingNumber && (
              <div className="flex justify-between items-center text-sm font-light">
                <span className="text-cream-soft">Tracking ID</span>
                <span className="font-mono text-gold-2">{order.trackingNumber}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-light">
              <span className="text-cream-soft">Payment Status</span>
              <span className="uppercase text-xs font-semibold text-green-400">{order.paymentStatus}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-noir-2 border border-line p-6 space-y-3">
            <h4 className="font-display text-base text-gold uppercase tracking-wider">Delivery Address</h4>
            <p className="text-sm font-light text-cream-soft leading-relaxed">
              {user?.name}<br />
              {order.shippingAddressLine}<br />
              {order.shippingCity}, {order.shippingState} - {order.shippingPincode}<br />
              India
            </p>
          </div>

          {/* Summary pricing */}
          <div className="bg-noir-2 border border-line p-6 space-y-4">
            <h4 className="font-display text-base text-gold uppercase tracking-wider pb-1">Price Summary</h4>
            <div className="space-y-2 text-xs font-light text-cream-soft">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (3%)</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="rule !mx-0"></div>
              <div className="flex justify-between text-sm font-medium text-gold">
                <span>Grand Total</span>
                <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default OrderDetails;
