import React, { useState } from 'react';
import { CreditCard, Loader2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { openRazorpayCheckout } from '../../services/razorpay';
import confetti from 'canvas-confetti';

/**
 * Reusable Razorpay Standard Checkout Button
 */
export const RazorpayCheckoutButton = ({
  amountInRupees = 100,
  amountInPaise,
  productName = 'KabadCollect Order',
  description = 'Recycling Marketplace Transaction',
  customerName = '',
  customerEmail = '',
  customerPhone = '',
  orderId = null,
  notes = {},
  onPaymentSuccess = null,
  onPaymentError = null,
  buttonText = null,
  className = '',
  style = {},
  variant = 'primary', // 'primary' | 'secondary' | 'accent' | 'outline'
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const displayAmount = amountInRupees || (amountInPaise ? amountInPaise / 100 : 0);

  const handleCheckout = async () => {
    if (disabled || loading) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      await openRazorpayCheckout({
        amountInRupees: displayAmount,
        amount: amountInPaise,
        name: 'KabadCollect',
        description: `${productName} — ${description}`,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        notes: {
          productName,
          orderId: orderId || '',
          ...notes
        },
        orderId: orderId,
        onSuccess: (paymentData) => {
          setLoading(false);
          setPaymentSuccess(paymentData);
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.7 }
            });
          } catch {
            // ignore confetti fallback
          }
          if (onPaymentSuccess) {
            onPaymentSuccess(paymentData);
          }
        },
        onError: (err) => {
          setLoading(false);
          setErrorMessage(err.message || 'Payment was unsuccessful or cancelled.');
          if (onPaymentError) {
            onPaymentError(err);
          }
        },
        onDismiss: () => {
          setLoading(false);
        }
      });
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Unable to open Razorpay payment gateway.');
      if (onPaymentError) {
        onPaymentError(err);
      }
    }
  };

  if (paymentSuccess) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.65rem 1rem',
        background: '#ECFDF5',
        border: '1px solid #10B981',
        borderRadius: 'var(--radius-md, 8px)',
        color: '#065F46',
        fontSize: '0.85rem',
        fontWeight: 600
      }}>
        <CheckCircle2 size={18} color="#059669" />
        <div>
          <div>Paid ₹{displayAmount.toLocaleString('en-IN')} via Razorpay</div>
          <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 500 }}>
            Ref: {paymentSuccess.razorpay_payment_id || paymentSuccess.payment_id}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={disabled || loading}
        className={className || `btn btn-${variant}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          fontSize: '0.9rem',
          fontWeight: 700,
          background: variant === 'primary' ? 'linear-gradient(135deg, #0D5C3A 0%, #16A34A 100%)' : undefined,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 'var(--radius-md, 8px)',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 12px rgba(13, 92, 58, 0.2)',
          transition: 'all 0.2s ease',
          ...style
        }}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
            <span>Connecting Razorpay...</span>
          </>
        ) : (
          <>
            <CreditCard size={18} />
            <span>{buttonText || `Pay ₹${displayAmount.toLocaleString('en-IN')} with Razorpay`}</span>
            <ShieldCheck size={16} style={{ opacity: 0.8 }} />
          </>
        )}
      </button>

      {errorMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          color: '#DC2626',
          fontSize: '0.75rem',
          padding: '0.25rem 0.5rem',
          background: '#FEF2F2',
          borderRadius: '4px',
          border: '1px solid #FCA5A5'
        }}>
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
