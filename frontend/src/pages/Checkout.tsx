import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { selectCartSummary, clearCartState } from '../features/cart/cartSlice';
import { placeOrder } from '../features/orders/orderSlice';
import { VehaApi } from '../utils/api';

declare global {
  interface Window {
    Stripe?: any;
    Razorpay?: any;
  }
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const summary = useAppSelector(selectCartSummary);
  const { user } = useAppSelector(state => state.auth);

  // Address States
  const [addr, setAddr] = useState('');
  const [addr2, setAddr2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pin, setPin] = useState('');
  
  // Contact States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');

  // Payment Option State (COD, STRIPE, RAZORPAY)
  const [payGateway, setPayGateway] = useState<'COD' | 'STRIPE' | 'RAZORPAY'>('COD');

  // Stripe & Script states
  const [stripeInstance, setStripeInstance] = useState<any>(null);
  const [stripeCard, setStripeCard] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('veha_token');
    if (!token) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (summary.items.length === 0) {
      navigate('/cart');
      return;
    }

    // Load Stripe and Razorpay scripts
    loadScripts();
  }, [summary.items, navigate]);

  const loadScripts = () => {
    // Stripe
    if (!window.Stripe) {
      const stripeScript = document.createElement('script');
      stripeScript.src = 'https://js.stripe.com/v3/';
      stripeScript.onload = () => initStripe();
      document.head.appendChild(stripeScript);
    } else {
      initStripe();
    }

    // Razorpay
    if (!window.Razorpay) {
      const rzpScript = document.createElement('script');
      rzpScript.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.head.appendChild(rzpScript);
    }
  };

  const initStripe = () => {
    try {
      // Initialize with test/mock key
      const stripe = window.Stripe!('pk_test_mock_stripe_key_placeholder');
      setStripeInstance(stripe);
      const elements = stripe.elements();
      const card = elements.create('card', {
        style: {
          base: {
            color: '#ECE4D2',
            fontFamily: 'Jost, sans-serif',
            fontSize: '14px',
            '::placeholder': { color: '#7C7461' },
          },
          invalid: { color: '#ff5e5e' }
        }
      });
      card.mount('#stripe-card-element');
      setStripeCard(card);
    } catch (e) {
      console.warn("Stripe failed to initialize, falling back to simulator mode.");
    }
  };

  const validateForm = (): boolean => {
    setErrorMsg('');
    if (!name.trim() || !email.trim() || !phone.trim() || !addr.trim() || !city.trim() || !state.trim() || !pin.trim()) {
      setErrorMsg("Please fill in all required delivery details.");
      return false;
    }
    return true;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setProcessing(true);

    const orderData = {
      shippingAddressLine: addr.trim(),
      shippingLandmark: addr2.trim(),
      shippingCity: city.trim(),
      shippingState: state.trim(),
      shippingPincode: pin.trim(),
      shippingCountry: 'India',
      billingAddressLine: addr.trim(),
      billingLandmark: addr2.trim(),
      billingCity: city.trim(),
      billingState: state.trim(),
      billingPincode: pin.trim(),
      billingCountry: 'India',
      paymentGateway: payGateway,
      couponCode: summary.items.length > 0 && summary.discount > 0 ? 'VEHA10' : null
    };

    try {
      if (payGateway === 'COD') {
        // Place COD order directly
        const res = await dispatch(placeOrder(orderData)).unwrap();
        navigate(`/orders/${res.id}`);
      } 
      else if (payGateway === 'RAZORPAY') {
        // Create order on Razorpay backend
        const rzpOrder = await VehaApi.registerPaymentIntentRazorpay();
        
        // Mock gateway simulator mode check
        if (rzpOrder.id === 'mock_razorpay_order_id') {
          // If sandbox simulated, verify with mock signatures
          const verify = await VehaApi.verifyPaymentRazorpay(
            'mock_razorpay_order_id',
            'mock_razorpay_payment_id',
            'mock_signature'
          );
          if (verify.status === 'SUCCESS') {
            const res = await dispatch(placeOrder(orderData)).unwrap();
            navigate(`/orders/${res.id}`);
          } else {
            throw new Error("Razorpay simulator verification failed");
          }
          return;
        }

        // Real Razorpay modal opening
        const options = {
          key: rzpOrder.keyId,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: "VEHA Jewelry",
          description: "Luxury Jewellery Purchase",
          order_id: rzpOrder.id,
          handler: async function (response: any) {
            try {
              const verify = await VehaApi.verifyPaymentRazorpay(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
              if (verify.status === 'SUCCESS') {
                const res = await dispatch(placeOrder(orderData)).unwrap();
                navigate(`/orders/${res.id}`);
              } else {
                setErrorMsg("Payment verification failed. Contact support.");
              }
            } catch (err: any) {
              setErrorMsg(err.message || "Payment signature verify error.");
            }
          },
          prefill: {
            name: name,
            email: email,
            contact: phone
          },
          theme: { color: "#C49B3F" }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } 
      else if (payGateway === 'STRIPE') {
        // Create payment intent on Stripe backend
        const intent = await VehaApi.registerPaymentIntentStripe();
        
        // Mock Stripe simulator check
        if (intent.clientSecret === 'mock_stripe_secret') {
          const res = await dispatch(placeOrder(orderData)).unwrap();
          navigate(`/orders/${res.id}`);
          return;
        }

        if (!stripeInstance || !stripeCard) {
          throw new Error("Stripe is not fully initialized. Use simulator or COD.");
        }

        // Real Stripe confirm payment
        const result = await stripeInstance.confirmCardPayment(intent.clientSecret, {
          payment_method: {
            card: stripeCard,
            billing_details: { name: name }
          }
        });

        if (result.error) {
          setErrorMsg(result.error.message || "Stripe transaction failed.");
        } else {
          if (result.paymentIntent.status === 'succeeded') {
            const res = await dispatch(placeOrder(orderData)).unwrap();
            navigate(`/orders/${res.id}`);
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while processing checkout.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="wrap sec text-left">
      <div className="sec-head">
        <span className="eyebrow">Secure checkouts</span>
        <h2 className="gold-text">Complete Checkout</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left Side: Delivery and Payment Details */}
        <form onSubmit={handleCheckoutSubmit} className="flex-1 space-y-8">
          
          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="font-display text-lg text-gold border-b border-line pb-2 uppercase tracking-wider">Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field">
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name" 
                  required 
                />
              </div>
              <div className="field">
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address" 
                  required 
                />
              </div>
            </div>
            <div className="field">
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Mobile Number" 
                required 
              />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="font-display text-lg text-gold border-b border-line pb-2 uppercase tracking-wider">Delivery Address</h3>
            <div className="field">
              <input 
                type="text" 
                value={addr} 
                onChange={(e) => setAddr(e.target.value)}
                placeholder="Address Line 1" 
                required 
              />
            </div>
            <div className="field">
              <input 
                type="text" 
                value={addr2} 
                onChange={(e) => setAddr2(e.target.value)}
                placeholder="Landmark / Apartment / Area (Optional)" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="field">
                <input 
                  type="text" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City" 
                  required 
                />
              </div>
              <div className="field">
                <input 
                  type="text" 
                  value={state} 
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State" 
                  required 
                />
              </div>
              <div className="field">
                <input 
                  type="text" 
                  value={pin} 
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Pin code" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Payment Gateways */}
          <div className="space-y-4">
            <h3 className="font-display text-lg text-gold border-b border-line pb-2 uppercase tracking-wider">Payment Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className={`pay-opt ${payGateway === 'COD' ? 'sel' : ''}`}
                onClick={() => setPayGateway('COD')}
              >
                <div className="text-sm font-medium text-gold">Cash On Delivery</div>
                <div className="text-[10px] text-cream-soft mt-1">Pay when package arrives</div>
              </div>
              
              <div 
                className={`pay-opt ${payGateway === 'RAZORPAY' ? 'sel' : ''}`}
                onClick={() => setPayGateway('RAZORPAY')}
              >
                <div className="text-sm font-medium text-gold">Razorpay (India)</div>
                <div className="text-[10px] text-cream-soft mt-1">UPI, Netbanking, Cards</div>
              </div>

              <div 
                className={`pay-opt ${payGateway === 'STRIPE' ? 'sel' : ''}`}
                onClick={() => setPayGateway('STRIPE')}
              >
                <div className="text-sm font-medium text-gold">Stripe (International)</div>
                <div className="text-[10px] text-cream-soft mt-1">Credit / Debit cards</div>
              </div>
            </div>

            {/* Stripe card element wrapper */}
            {payGateway === 'STRIPE' && (
              <div className="stripe-element-container animate-fade-in">
                <label className="text-xs text-gold uppercase tracking-wider mb-2 block">Card Details</label>
                <div id="stripe-card-element" className="p-3 border border-line-2 bg-noir"></div>
              </div>
            )}
          </div>

          {errorMsg && (
            <p className="text-sm text-err bg-err/10 border border-err/20 p-3 text-center">{errorMsg}</p>
          )}

          <button 
            type="submit" 
            className="btn solid !py-4 !px-8 text-xs !w-full justify-center"
            disabled={processing}
          >
            {processing ? 'Processing order...' : 'Place Order'}
          </button>
        </form>

        {/* Right Side: Order summary */}
        <div className="w-full lg:w-[400px] bg-noir-2 border border-line p-6 space-y-6 self-start">
          <h4 className="font-display text-lg text-gold border-b border-line pb-3 uppercase tracking-wider">Purchase Items</h4>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {summary.items.map(item => (
              <div key={item.id} className="osum-line">
                <div className="mini">
                  {item.svg ? (
                    <div dangerouslySetInnerHTML={{ __html: item.svg }} className="w-full h-full opacity-75" />
                  ) : (
                    <span className="text-[9px] uppercase text-gold">item</span>
                  )}
                  <span className="qb">{item.qty}</span>
                </div>
                <div className="oi">
                  <div className="n">{item.name}</div>
                  <div className="v">{item.variant}</div>
                </div>
                <div className="lt">₹{(item.price * item.qty).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>

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

            <div className="rule !mx-0"></div>

            <div className="flex justify-between text-base font-medium text-gold">
              <span>Grand Total</span>
              <span>₹{summary.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Checkout;
