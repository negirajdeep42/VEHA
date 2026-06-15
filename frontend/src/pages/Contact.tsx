import React, { useState } from 'react';
import { VehaApi } from '../utils/api';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await VehaApi.submitContact(name, email, subject || "Customer Inquiry", message);
      setMsg(res.message || "Thank you! Your message has been received.");
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || "Submission failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap sec text-left space-y-12">
      <div className="sec-head">
        <span className="eyebrow">Connect</span>
        <h2 className="gold-text">Contact the House</h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Contact information */}
        <div className="flex-1 space-y-8 font-light text-sm leading-relaxed text-cream-soft">
          <div className="space-y-3">
            <h3 className="font-display text-lg text-gold uppercase tracking-wider">The Maison</h3>
            <p>
              VEHA Jewelry Atelier<br />
              Colaba Causeway, Apollo Bandar<br />
              Colaba, Mumbai, Maharashtra 400001
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-lg text-gold uppercase tracking-wider">Customer Care</h3>
            <p>
              Telephone: +91 22 2847 9000<br />
              Email: care@veha.com<br />
              Available Monday &mdash; Saturday, 10:00 AM &mdash; 7:00 PM IST
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-lg text-gold uppercase tracking-wider">Maison Services</h3>
            <p>
              Complimentary jewelry cleaning & polishing services are offered to all patrons at our Mumbai store location. Stamped hallmarks will be verified upon entry.
            </p>
          </div>
        </div>

        {/* Contact ticketing form */}
        <div className="w-full lg:w-[500px] bg-noir-2 border border-line p-8 space-y-6">
          <h3 className="font-display text-lg text-gold uppercase tracking-wider border-b border-line pb-2">Send an Inquiry</h3>
          
          {error && <p className="text-xs text-err bg-err/10 border border-err/20 p-3 text-center">{error}</p>}
          {msg && <p className="text-xs text-gold bg-gold/10 border border-gold/20 p-3 text-center">{msg}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="field">
                <input 
                  type="text" 
                  placeholder="Your Name *" 
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
            </div>
            
            <div className="field">
              <input 
                type="text" 
                placeholder="Subject" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="field">
              <textarea 
                rows={5}
                placeholder="Your message details *" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-noir border border-line-2 px-3 py-2 text-sm text-cream outline-none font-light resize-none"
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn solid !w-full justify-center !py-4 text-xs"
              disabled={loading}
            >
              {loading ? 'Submitting inquiry...' : 'Submit Inquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Contact;
