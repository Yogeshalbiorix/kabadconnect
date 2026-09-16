import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Clock, 
  Send, 
  CheckCircle, 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  Building2, 
  ArrowRight,
  Headphones,
  ExternalLink
} from 'lucide-react';

export const ContactPage = ({ 
  onOpenBooking = () => {}, 
  onOpenPartnerModal = () => {},
  currentUser = null,
  orders = [] 
}) => {
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    category: 'Pickup Issue',
    orderId: '',
    subject: '',
    message: ''
  });

  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState('All');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please complete all required fields (Name, Email, and Message).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const ticketId = `TICKET-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTicket = {
        id: ticketId,
        ...formData,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        estimatedResolution: 'Under 15 minutes'
      };

      try {
        const existing = JSON.parse(localStorage.getItem('kabadcollect_support_tickets') || '[]');
        localStorage.setItem('kabadcollect_support_tickets', JSON.stringify([newTicket, ...existing]));
      } catch (err) {}

      setSubmittedTicket(newTicket);
      setIsSubmitting(false);
    }, 600);
  };

  const CATEGORIES = [
    { value: 'Pickup Issue', label: '🚚 Live Pickup Delay / Agent Tracking' },
    { value: 'Rate & Scale Verification', label: '⚖️ Digital Scale Check / Scrap Rate Inquiry' },
    { value: 'Payout & Wallet', label: '💳 Eco Wallet & Instant UPI Payout' },
    { value: 'Bazaar Listing', label: '🛍️ Pre-Loved Marketplace Resale Item' },
    { value: 'Bulk Scrap Pickup', label: '🏢 Corporate / Office Heavy Scrap' },
    { value: 'Partner Onboarding', label: '🤝 Kabadwala Partner Onboarding' },
    { value: 'General Feedback', label: '💬 General Query or Suggestion' }
  ];

  const REGIONAL_HUBS = [
    {
      city: 'Delhi NCR Headquarters',
      address: 'Plot 42, Circular Economy Park, Sector 62, Indirapuram Zone, Delhi NCR - 201014',
      phone: '+91 98100 23456',
      email: 'delhi@kabadcollect.in',
      hours: '8:00 AM – 8:00 PM IST (Mon-Sun)',
      badge: 'Main Operations Hub'
    },
    {
      city: 'Ahmedabad Regional Yard',
      address: 'Shop 14, Green Recycling Hub, Near Iscon Circle, SG Highway, Ahmedabad - 380015',
      phone: '+91 98250 99887',
      email: 'ahmedabad@kabadcollect.in',
      hours: '8:30 AM – 7:30 PM IST (Mon-Sat)',
      badge: 'West Zone Facility'
    },
    {
      city: 'Bengaluru Tech & Circular Hub',
      address: 'Suite 302, Eco-Tech Towers, 80 Feet Road, Koramangala 4th Block, Bengaluru - 560034',
      phone: '+91 98450 11223',
      email: 'bengaluru@kabadcollect.in',
      hours: '8:00 AM – 8:00 PM IST (Mon-Sun)',
      badge: 'South Operations'
    },
    {
      city: 'Mumbai Coastal Yard',
      address: 'Unit 8, MIDC Industrial Estate, Andheri East, Mumbai - 400093',
      phone: '+91 98200 44556',
      email: 'mumbai@kabadcollect.in',
      hours: '8:00 AM – 7:30 PM IST (Mon-Sat)',
      badge: 'Coastal Recycling'
    }
  ];

  const FAQS = [
    {
      category: 'Pickup & Booking',
      question: 'How does KabadCollect doorstep scrap pickup work?',
      answer: 'Simply tap "Schedule Pickup", choose your scrap items (Paper, Metals, E-Waste, Appliances), and select your preferred date & time slot. Our verified local kabadwala arrives at your doorstep with a certified Bluetooth digital scale, weighs items transparently, and transfers instant cash to your UPI or Eco Wallet.'
    },
    {
      category: 'Scales & Rates',
      question: 'How do you guarantee 100% accurate weight with no scale cheating?',
      answer: 'Traditional street collectors often tamper with mechanical spring scales by 20-30%. KabadCollect field agents carry government-inspected, Bluetooth-enabled digital scales that display live weight metrics directly on your smartphone screen.'
    },
    {
      category: 'Wallet & UPI',
      question: 'How fast is the payout credited to my account?',
      answer: 'Payouts are instantaneous! As soon as the collector verifies the weight and inputs the inspection code, money is transferred in real-time via Instant UPI, IMPS, or credited to your KabadCollect Eco Wallet with a 5% Green Coin bonus.'
    },
    {
      category: 'Pickup & Booking',
      question: 'Is there any pickup fee or minimum weight requirement?',
      answer: 'Doorstep pickup is 100% FREE for scrap orders weighing 15 kg or more. For smaller quantities under 15 kg, a nominal ₹20 eco-transport charge applies, which is automatically offset if you add e-waste or metals.'
    },
    {
      category: 'Corporate',
      question: 'Do you provide GST invoices & green disposal certificates for offices?',
      answer: 'Yes! We issue official Form-6 Hazardous Waste Receipts and ISO-certified Green Landfill Diversion Certificates for corporate IT disposals, office cleanouts, and factory scrap auctions.'
    },
    {
      category: 'Pre-Loved Bazaar',
      question: 'How can I buy or sell pre-loved furniture and appliances on the Bazaar?',
      answer: 'Navigate to "Pre-Loved Bazaar" from the top menu, tap "List Item to Sell", upload photos of your usable sofa, AC, laptop, or bicycle, and set your price. Interested buyers in your neighborhood contact you directly via verified WhatsApp.'
    }
  ];

  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = selectedFaqCategory === 'All' || faq.category === selectedFaqCategory;
    const matchesSearch = faq.question.toLowerCase().includes(faqSearchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(faqSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #072e1c 0%, #0D5C3A 50%, #083c26 100%)',
        color: '#FFFFFF',
        padding: '3.5rem 0 4rem 0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            background: 'rgba(52, 211, 153, 0.15)',
            border: '1px solid rgba(52, 211, 153, 0.35)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#34D399',
            marginBottom: '1rem'
          }}>
            <Headphones size={15} /> 24/7 Dedicated Support & Assistance Hub
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 3.8vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1rem',
            maxWidth: '800px'
          }}>
            We're Here to Help You Recycle Seamlessly
          </h1>

          <p style={{
            fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
            color: '#CBD5E1',
            maxWidth: '680px',
            lineHeight: 1.6,
            marginBottom: '2rem'
          }}>
            Have a question about live scrap rates, digital scale verification, instant UPI payouts, or need help tracking your doorstep collector? Reach out to our team!
          </p>

          {/* Quick Contact Highlight Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            maxWidth: '1000px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34D399', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                <Phone size={15} /> Toll-Free Helpline
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>
                1800-KABAD-COLLECT
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
                (1800-522-2326) • Mon–Sun 8AM-8PM
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34D399', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                <Mail size={15} /> Support Email
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>
                support@kabadcollect.in
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
                Average Email SLA: Under 15 mins
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34D399', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                <MessageSquare size={15} /> Live WhatsApp Chat
              </div>
              <a 
                href="https://wa.me/919810023456?text=Hi%20KabadCollect%20Support%2C%20I%20need%20assistance%20with%20my%20scrap%20pickup."
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '1.05rem', fontWeight: 800, color: '#4ADE80', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                +91 98100 23456 <ExternalLink size={13} />
              </a>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px' }}>
                Instant WhatsApp bot & live desk
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Support Form & Regional Offices */}
      <div className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '2rem'
        }}>
          
          {/* Left: Support Request Form */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
            border: '1px solid var(--color-border)',
            padding: 'clamp(1.25rem, 3vw, 2.25rem)'
          }}>
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={20} color="var(--color-primary)" /> Submit Support Ticket
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                Fill out the form below. Our support team responds within 15 minutes.
              </p>
            </div>

            {submittedTicket ? (
              <div style={{
                background: '#ECFDF5',
                border: '1.5px solid #10B981',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <CheckCircle size={44} color="#059669" style={{ marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065F46', margin: 0 }}>
                  Ticket Submitted Successfully!
                </h4>
                <div style={{
                  background: '#FFFFFF',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  margin: '1rem 0',
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#0D5C3A',
                  border: '1px solid #A7F3D0'
                }}>
                  Reference ID: {submittedTicket.id}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#047857', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  We have dispatched your request to the regional collection supervisor for <strong>{submittedTicket.category}</strong>. Estimated resolution: <strong>{submittedTicket.estimatedResolution}</strong>.
                </p>
                <button
                  onClick={() => setSubmittedTicket(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                
                {/* Category */}
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    Issue Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-input"
                    style={{ fontWeight: 600 }}
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Name & Email Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aarav Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="aarav@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                {/* Phone & Order Selection */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Mobile Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98100 23456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      Related Pickup Order (Optional)
                    </label>
                    <select
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      className="form-input"
                    >
                      <option value="">-- Select Order if Applicable --</option>
                      {orders.map(o => (
                        <option key={o.id} value={o.id}>
                          Order #{o.id} ({o.status || 'Active'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Agent delay for Indirapuram pickup slot"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    Detailed Message *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe your query or issue in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-full"
                  style={{ padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
                >
                  {isSubmitting ? 'Submitting Ticket...' : '🚀 Submit Ticket'}
                </button>
              </form>
            )}
          </div>

          {/* Right: Regional Hub Directory & Quick Actions */}
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={20} color="var(--color-primary)" /> Regional Hubs & Offices
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                Visit or call our certified yard collection centers directly.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {REGIONAL_HUBS.map((hub, idx) => (
                <div key={idx} style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.15rem',
                  boxShadow: 'var(--shadow-xs)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)' }}>
                      {hub.city}
                    </div>
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#059669',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {hub.badge}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <MapPin size={14} color="var(--color-accent-mint)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{hub.address}</span>
                  </p>

                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={13} /> {hub.phone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {hub.hours}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action CTA Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginTop: '1.5rem',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)'
            }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                Need Immediate Scrap Pickup?
              </h4>
              <p style={{ fontSize: '0.85rem', opacity: 0.95, margin: '0.35rem 0 1rem 0' }}>
                Skip ticket wait times! Schedule your doorstep pickup in 60 seconds.
              </p>
              <button
                onClick={onOpenBooking}
                className="btn"
                style={{
                  background: '#FFFFFF',
                  color: '#059669',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  width: '100%',
                  border: 'none'
                }}
              >
                Schedule Pickup Now ➔
              </button>
            </div>
          </div>

        </div>

        {/* Section 2: Interactive FAQ Accordion */}
        <div style={{ marginTop: '4rem' }}>
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="section-subtitle" style={{ justifyContent: 'center' }}>
              <HelpCircle size={14} />
              <span>Instant Answers</span>
            </div>
            <h2 className="section-title">
              Frequently Asked Questions
            </h2>
            <p className="section-description" style={{ margin: '0 auto' }}>
              Search common questions regarding rates, scale calibration, payouts, and e-waste disposal.
            </p>
          </div>

          {/* FAQ Search Bar & Category Filters */}
          <div style={{ maxWidth: '750px', margin: '0 auto 2rem auto' }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search FAQs (e.g., scale, pricing, UPI, minimum weight)..."
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '44px', fontSize: '1rem', borderRadius: 'var(--radius-full)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['All', 'Pickup & Booking', 'Scales & Rates', 'Wallet & UPI', 'Corporate'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedFaqCategory(cat)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: selectedFaqCategory === cat ? 'var(--color-primary)' : 'var(--color-border)',
                    background: selectedFaqCategory === cat ? 'var(--color-primary)' : '#FFFFFF',
                    color: selectedFaqCategory === cat ? '#FFFFFF' : 'var(--color-text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion Cards List */}
          <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isExpanded = expandedFaqIndex === idx;
                return (
                  <div key={idx} style={{
                    background: '#FFFFFF',
                    border: `1.5px solid ${isExpanded ? 'var(--color-accent-mint)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    boxShadow: isExpanded ? 'var(--shadow-sm)' : 'none'
                  }}>
                    <button
                      onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '1.15rem 1.25rem',
                        background: 'transparent',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: 'var(--color-primary)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#059669',
                          fontSize: '0.725rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {faq.category}
                        </span>
                        <span>{faq.question}</span>
                      </div>
                      {isExpanded ? <ChevronUp size={18} color="var(--color-primary)" /> : <ChevronDown size={18} color="#64748B" />}
                    </button>

                    {isExpanded && (
                      <div style={{
                        padding: '0 1.25rem 1.25rem 1.25rem',
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        borderTop: '1px solid #F1F5F9',
                        paddingTop: '0.85rem'
                      }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                No questions found matching "{faqSearchQuery}". Try another keyword or submit a support ticket above.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
