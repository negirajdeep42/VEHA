import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchCart, updateCartQty, removeFromCart, applyCoupon, selectCartSummary } from '../features/cart/cartSlice';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const summary = useAppSelector(selectCartSummary);
  const { loading } = useAppSelector(state => state.cart);
  const [promoText, setPromoText] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQtyChange = (itemId: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty >= 1) {
      dispatch(updateCartQty({ id: itemId, qty: newQty }));
    }
  };

  const handleRemove = (itemId: string) => {
    dispatch(removeFromCart(itemId));
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    
    const code = promoText.trim().toUpperCase();
    if (code === 'VEHA10') {
      dispatch(applyCoupon('VEHA10'));
      setPromoSuccess('Promo code VEHA10 applied successfully (10% off).');
    } else if (!code) {
      setPromoError('Please enter a promo code.');
    } else {
      setPromoError('Invalid promo code.');
    }
  };

  const handleCheckoutRedirect = () => {
    const token = localStorage.getItem('veha_token');
    if (token) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=/checkout');
    }
  };

  if (loading && summary.items.length === 0) {
    return (
      <div className="wrap sec text-center py-20">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-gold border-t-transparent rounded-full" />
        <p className="mt-4 text-cream-soft font-light">Loading shopping bag...</p>
      </div>
    );
  }

  return (
    <div className="wrap sec text-left">
      <div className="sec-head">
        <span className="eyebrow">Shopping bag</span>
        <h2 className="gold-text">Your Cart</h2>
      </div>

      {summary.items.length === 0 ? (
        <div className="border border-dashed border-line p-12 text-center space-y-6">
          <p className="text-cream-soft font-light">Your shopping bag is currently empty.</p>
          <Link to="/shop" className="btn solid">Browse Collection</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Cart Items List */}
          <div className="flex-1 space-y-6">
            {summary.items.map(item => {
              const priceTotal = item.price * item.qty;
              return (
                <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-line p-4 sm:p-6 bg-noir-2 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-radial-gradient border border-line flex items-center justify-center flex-shrink-0">
                      {item.svg ? (
                        <div dangerouslySetInnerHTML={{ __html: item.svg }} className="w-4/5 h-4/5" />
                      ) : (
                        <img 
                          src={`/images/products/${item.id.split('-')[0]}.jpeg`} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="font-display text-base text-gold">{item.name}</h4>
                      <p className="text-xs text-cream-soft font-light uppercase tracking-wider">{item.variant}</p>
                      <p className="text-sm text-gold-2 font-medium mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center border border-line-2 bg-noir">
                      <button 
                        type="button" 
                        className="w-8 h-8 flex items-center justify-center text-cream-soft hover:text-gold"
                        onClick={() => handleQtyChange(item.id, item.qty, -1)}
                      >
                        &minus;
                      </button>
                      <span className="w-8 text-center text-xs font-light">{item.qty}</span>
                      <button 
                        type="button" 
                        className="w-8 h-8 flex items-center justify-center text-cream-soft hover:text-gold"
                        onClick={() => handleQtyChange(item.id, item.qty, 1)}
                      >
                        &#43;
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-cream">₹{priceTotal.toLocaleString('en-IN')}</p>
                      <button 
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="text-[10px] text-err hover:underline uppercase tracking-wider mt-1 block"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary Card */}
          <div className="w-full lg:w-[380px] bg-noir-2 border border-line p-6 space-y-6 self-start">
            <h4 className="font-display text-lg text-gold uppercase tracking-wider border-b border-line pb-3">Order Summary</h4>
            
            {/* Calculations */}
            <div className="space-y-3 text-sm font-light">
              <div className="flex justify-between">
                <span className="text-cream-soft">Subtotal</span>
                <span>₹{summary.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {summary.discount > 0 && (
                <div className="flex justify-between text-gold">
                  <span>Discount</span>
                  <span>&minus;₹{summary.discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-cream-soft">GST (3%)</span>
                <span>₹{summary.tax.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-cream-soft">Shipping</span>
                <span>{summary.shipping === 0 ? 'Free' : `₹${summary.shipping}`}</span>
              </div>

              <div className="rule"></div>

              <div className="flex justify-between text-base font-medium text-gold">
                <span>Total</span>
                <span>₹{summary.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="news-form !border-line-2">
              <input 
                type="text" 
                placeholder="PROMO CODE" 
                value={promoText}
                onChange={(e) => setPromoText(e.target.value)}
                className="!py-2.5 !px-3 text-xs"
              />
              <button type="submit" className="!py-2.5 !px-4 text-[10px]">Apply</button>
            </form>
            {promoError && <p className="text-xs text-err text-center">{promoError}</p>}
            {promoSuccess && <p className="text-xs text-gold text-center">{promoSuccess}</p>}

            <button 
              type="button"
              onClick={handleCheckoutRedirect}
              className="btn solid !w-full justify-center !py-4"
            >
              Proceed to checkout
            </button>

            <p className="text-[10px] text-cream-dim text-center leading-relaxed">
              Safe & Secure checkouts. Hallmarked certified items shipped within 48 hours.
            </p>
          </div>

        </div>
      )}
    </div>
  );
};
export default Cart;
