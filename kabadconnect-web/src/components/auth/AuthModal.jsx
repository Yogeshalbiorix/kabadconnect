import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Phone, 
  KeyRound, 
  MapPin, 
  UserPlus, 
  LogIn, 
  Building2, 
  Truck, 
  Loader2, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';
import { 
  loginUser, 
  registerUser, 
  sendAuthOtp, 
  loginWithOtp, 
  verifyRegisterOtp 
} from '../../utils/auth';

export const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' or 'password'
  
  // Password Login State
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP Login State
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  
  // Register Form State
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    city: 'Delhi NCR',
    pincode: '',
    address: ''
  });
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpCode, setRegOtpCode] = useState('');
  const [regEmailVerified, setRegEmailVerified] = useState(false);
  const [regCountdown, setRegCountdown] = useState(0);

  // Status & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Countdown timer effect for OTP resend
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  useEffect(() => {
    let timer;
    if (regCountdown > 0) {
      timer = setInterval(() => {
        setRegCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [regCountdown]);

  if (!isOpen) return null;

  // ----------------------------------------------------
  // OTP Login: Step 1 - Send OTP to Real Email
  // ----------------------------------------------------
  const handleSendLoginOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmed = otpEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendAuthOtp(trimmed, 'login');
      if (res.success) {
        setOtpSent(true);
        setOtpCountdown(60);
        setSuccessMessage(`✓ Verification code sent to ${trimmed}. Please check your inbox.`);
      } else {
        setErrorMessage(res.error || 'Failed to send OTP. Please check your email.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error sending verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ----------------------------------------------------
  // OTP Login: Step 2 - Verify OTP & Sign In
  // ----------------------------------------------------
  const handleVerifyLoginOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedOtp = otpCode.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setErrorMessage('Please enter the 6-digit code received on your email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithOtp(otpEmail.trim().toLowerCase(), trimmedOtp);
      if (res.success && res.user) {
        setSuccessMessage(`✓ Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(res.user);
          onClose();
        }, 600);
      } else {
        setErrorMessage(res.error || 'Invalid or expired code. Please check your email and try again.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to verify code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // Password Login Handler
  // ----------------------------------------------------
  const handlePasswordLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your email or mobile number.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginUser(emailOrPhone, password);
      if (res.success && res.user) {
        setSuccessMessage(`✓ Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(res.user);
          onClose();
        }, 600);
      } else {
        setErrorMessage(res.error || 'Invalid credentials. Please check your details.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // Register: Step 1 - Send Real Email OTP
  // ----------------------------------------------------
  const handleSendRegOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const trimmed = regData.email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setErrorMessage('Please enter a valid email address first.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendAuthOtp(trimmed, 'register');
      if (res.success) {
        setRegOtpSent(true);
        setRegCountdown(60);
        setSuccessMessage(`✓ Verification code sent to ${trimmed}. Please check your inbox.`);
      } else {
        setErrorMessage(res.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error sending code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ----------------------------------------------------
  // Register: Step 2 - Verify Email OTP
  // ----------------------------------------------------
  const handleVerifyRegOtp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedOtp = regOtpCode.trim();
    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyRegisterOtp(regData.email.trim().toLowerCase(), trimmedOtp);
      if (res.success) {
        setRegEmailVerified(true);
        setSuccessMessage('✓ Email verified successfully! You can now complete your registration.');
      } else {
        setErrorMessage(res.error || 'Invalid or expired code.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to verify code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // Register: Final Submit Handler
  // ----------------------------------------------------
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regData.email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!regEmailVerified) {
      if (regOtpCode.trim().length === 6) {
        // Will be verified on server
      } else if (regOtpSent) {
        setErrorMessage('Please enter the 6-digit verification code sent to your email.');
        return;
      } else {
        setErrorMessage('Please verify your email with OTP first by clicking "Send OTP".');
        return;
      }
    }
    if (!regData.password.trim() || regData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...regData,
        email: regData.email.toLowerCase().trim(),
        otp: regOtpCode.trim() || undefined
      };

      const res = await registerUser(payload);
      if (res.success && res.user) {
        setSuccessMessage(`✓ Account created successfully! Welcome, ${res.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(res.user);
          onClose();
        }, 700);
      } else {
        setErrorMessage(res.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error saving user to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-content auth-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: authMode === 'register' ? '540px' : '450px', 
          width: '100%',
          maxHeight: '90vh',
          maxHeight: '90dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Pinned Modal Header */}
        <div className="modal-header auth-modal-header" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.15rem 1.5rem',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0D5C3A 0%, #10B981 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0
            }}>
              {authMode === 'register' ? <UserPlus size={20} /> : <LogIn size={20} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>
                {authMode === 'register' ? 'Create New Account' : 'Account Sign In'}
              </h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)', margin: 0 }}>
                {authMode === 'register' ? 'Verify with Email OTP' : 'Login via OTP or Password'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="modal-close-btn" aria-label="Close auth modal">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="modal-body auth-modal-body" style={{
          padding: '1.25rem 1.5rem',
          overflowY: 'auto',
          flex: 1,
          minHeight: 0
        }}>
          {/* Main Mode Switcher: Sign In vs Create Account */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'rgba(13, 92, 58, 0.06)',
            borderRadius: 'var(--radius-full)',
            padding: '4px',
            marginBottom: '1.15rem',
            border: '1px solid rgba(13, 92, 58, 0.15)',
            flexShrink: 0
          }}>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: authMode === 'login' ? '#FFFFFF' : 'transparent',
                color: authMode === 'login' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: authMode === 'login' ? 'var(--shadow-xs)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease'
              }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: authMode === 'register' ? '#FFFFFF' : 'transparent',
                color: authMode === 'register' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: authMode === 'register' ? 'var(--shadow-xs)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s ease'
              }}
            >
              <UserPlus size={15} />
              <span>Create Account</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div style={{
              padding: '0.75rem 0.95rem',
              background: '#FEF2F2',
              border: '1px solid #F87171',
              borderRadius: 'var(--radius-md)',
              color: '#991B1B',
              fontSize: '0.825rem',
              marginBottom: '1rem',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.45rem'
            }}>
              <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div style={{
              padding: '0.75rem 0.95rem',
              background: '#ECFDF5',
              border: '1px solid #34D399',
              borderRadius: 'var(--radius-md)',
              color: '#065F46',
              fontSize: '0.825rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.45rem',
              lineHeight: 1.4
            }}>
              <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODE 1: SIGN IN FORM (OTP OR PASSWORD)                       */}
          {/* ============================================================ */}
          {authMode === 'login' && (
            <div>
              {/* Sign In Method Toggle */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.25rem',
                padding: '3px',
                background: '#F1F5F9',
                borderRadius: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('otp');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: loginMethod === 'otp' ? '#FFFFFF' : 'transparent',
                    color: loginMethod === 'otp' ? 'var(--color-primary)' : '#64748B',
                    boxShadow: loginMethod === 'otp' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Mail size={14} />
                  <span>Email OTP Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('password');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: loginMethod === 'password' ? '#FFFFFF' : 'transparent',
                    color: loginMethod === 'password' ? 'var(--color-primary)' : '#64748B',
                    boxShadow: loginMethod === 'password' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Lock size={14} />
                  <span>Password Login</span>
                </button>
              </div>

              {/* -------------------- OPTION A: OTP LOGIN -------------------- */}
              {loginMethod === 'otp' && (
                <div>
                  {!otpSent ? (
                    /* Step 1: Request OTP */
                    <form onSubmit={handleSendLoginOtp}>
                      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label">
                          Email Address *
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="email"
                            className="form-input"
                            placeholder="Enter your registered email address"
                            value={otpEmail}
                            onChange={(e) => setOtpEmail(e.target.value)}
                            style={{ paddingLeft: '38px' }}
                            autoComplete="email"
                            required
                          />
                          <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.35rem', marginBottom: 0 }}>
                          We will send a 6-digit verification code to your email inbox.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSendingOtp}
                        className="btn btn-primary btn-full"
                        style={{ padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700 }}
                      >
                        {isSendingOtp ? (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                            <Loader2 size={17} className="animate-spin" />
                            <span>Sending Email to {otpEmail || 'your inbox'}...</span>
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                            <span>Send Verification Code</span>
                            <ArrowRight size={17} />
                          </span>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Step 2: Enter & Verify OTP */
                    <form onSubmit={handleVerifyLoginOtp}>
                      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <label className="form-label" style={{ margin: 0 }}>
                            Enter 6-Digit Code *
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              setOtpCode('');
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-primary)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: 0
                            }}
                          >
                            Change Email ({otpEmail})
                          </button>
                        </div>

                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            maxLength={6}
                            className="form-input"
                            placeholder="• • • • • •"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            style={{ 
                              textAlign: 'center', 
                              letterSpacing: '8px', 
                              fontSize: '1.4rem', 
                              fontWeight: 800,
                              fontFamily: 'monospace'
                            }}
                            autoFocus
                            required
                          />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.45rem', marginBottom: 0 }}>
                          Please check your inbox or spam folder for the code sent to <strong>{otpEmail}</strong>.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting || otpCode.length !== 6}
                        className="btn btn-primary btn-full"
                        style={{ padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}
                      >
                        {isSubmitting ? (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                            <Loader2 size={17} className="animate-spin" />
                            <span>Verifying Code...</span>
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                            <ShieldCheck size={17} />
                            <span>Verify & Sign In</span>
                          </span>
                        )}
                      </button>

                      {/* Resend OTP with countdown */}
                      <div style={{ textAlign: 'center' }}>
                        {otpCountdown > 0 ? (
                          <span style={{ fontSize: '0.785rem', color: '#64748B' }}>
                            Resend code in <strong>{otpCountdown}s</strong>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendLoginOtp}
                            disabled={isSendingOtp}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-primary)',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <RefreshCw size={13} className={isSendingOtp ? 'animate-spin' : ''} />
                            <span>Resend Code to Email</span>
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* -------------------- OPTION B: PASSWORD LOGIN -------------------- */}
              {loginMethod === 'password' && (
                <form onSubmit={handlePasswordLoginSubmit}>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">
                      Email Address or Mobile Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter your registered email or phone"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        style={{ paddingLeft: '38px' }}
                        autoComplete="username"
                        required
                      />
                      <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ paddingLeft: '38px', paddingRight: '38px' }}
                        autoComplete="current-password"
                        required
                      />
                      <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94A3B8'
                        }}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary btn-full"
                    style={{ padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700 }}
                  >
                    {isSubmitting ? (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                        <Loader2 size={17} className="animate-spin" />
                        <span>Verifying Credentials...</span>
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                        <span>Sign In</span>
                        <ArrowRight size={17} />
                      </span>
                    )}
                  </button>
                </form>
              )}

              {/* Bottom Switcher Link */}
              <div style={{
                textAlign: 'center',
                marginTop: '1.25rem',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)'
              }}>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODE 2: REGISTER / CREATE NEW USER WITH EMAIL OTP            */}
          {/* ============================================================ */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              {/* Account Role Selector */}
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  Select Account Role
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { role: 'user', label: 'Resident', icon: User },
                    { role: 'agent', label: 'Field Agent', icon: Truck },
                    { role: 'partner', label: 'Scrap Merchant', icon: Building2 }
                  ].map((r) => {
                    const Icon = r.icon;
                    const isSelected = regData.role === r.role;
                    return (
                      <button
                        key={r.role}
                        type="button"
                        onClick={() => setRegData({ ...regData, role: r.role })}
                        style={{
                          padding: '0.5rem 0.35rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                          background: isSelected ? 'rgba(13, 92, 58, 0.08)' : '#FFFFFF',
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.2rem',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon size={16} color={isSelected ? 'var(--color-primary)' : '#64748B'} />
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name */}
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                  <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Email Address with OTP Verification */}
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Email Address *
                  </label>
                  {regEmailVerified && (
                    <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={13} color="#059669" /> Verified
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="e.g. name@domain.com"
                      value={regData.email}
                      disabled={regEmailVerified}
                      onChange={(e) => {
                        setRegData({ ...regData, email: e.target.value });
                        setRegOtpSent(false);
                        setRegEmailVerified(false);
                      }}
                      style={{ paddingLeft: '36px' }}
                      required
                    />
                    <Mail size={15} color="#94A3B8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>

                  {!regEmailVerified && (
                    <button
                      type="button"
                      onClick={handleSendRegOtp}
                      disabled={isSendingOtp || !regData.email.includes('@')}
                      style={{
                        padding: '0 0.85rem',
                        fontSize: '0.785rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-md)',
                        background: regOtpSent ? '#F1F5F9' : 'var(--color-primary)',
                        color: regOtpSent ? 'var(--color-primary)' : '#FFFFFF',
                        border: regOtpSent ? '1px solid var(--color-border)' : 'none',
                        cursor: regData.email.includes('@') ? 'pointer' : 'not-allowed',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      {isSendingOtp ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : regOtpSent ? (
                        <RefreshCw size={13} />
                      ) : (
                        <KeyRound size={13} />
                      )}
                      <span>{regOtpSent ? (regCountdown > 0 ? `${regCountdown}s` : 'Resend') : 'Send OTP'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* OTP Input for Registration */}
              {regOtpSent && !regEmailVerified && (
                <div style={{
                  background: 'rgba(13, 92, 58, 0.04)',
                  border: '1px dashed #10B981',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  marginBottom: '0.85rem'
                }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    Enter 6-Digit Code sent to {regData.email}
                  </label>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      maxLength={6}
                      className="form-input"
                      placeholder="6-digit code"
                      value={regOtpCode}
                      onChange={(e) => setRegOtpCode(e.target.value.replace(/\D/g, ''))}
                      style={{ 
                        flex: 1, 
                        textAlign: 'center', 
                        letterSpacing: '4px', 
                        fontWeight: 700,
                        fontFamily: 'monospace'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyRegOtp}
                      disabled={isSubmitting || regOtpCode.length !== 6}
                      className="btn btn-primary"
                      style={{ padding: '0 1rem', fontSize: '0.8rem', fontWeight: 700 }}
                    >
                      {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Number & Password Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. 9876543210"
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      style={{ paddingLeft: '36px' }}
                    />
                    <Phone size={15} color="#94A3B8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password * (min 6)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Set password"
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      style={{ paddingLeft: '36px', paddingRight: '36px' }}
                      minLength={6}
                      required
                    />
                    <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8'
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* City & Address */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">City Hub</label>
                  <select
                    className="form-select"
                    value={regData.city}
                    onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                  >
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Gurugram">Gurugram</option>
                    <option value="Ghaziabad">Ghaziabad & Noida</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 380015"
                    value={regData.pincode}
                    onChange={(e) => setRegData({ ...regData, pincode: e.target.value })}
                  />
                </div>
              </div>

              {/* Street Address */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Street Address / Locality</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Flat / Building, Area, Landmark"
                    value={regData.address}
                    onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                    style={{ paddingLeft: '38px' }}
                  />
                  <MapPin size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary btn-full"
                style={{ padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700 }}
              >
                {isSubmitting ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                    <Loader2 size={17} className="animate-spin" />
                    <span>Creating Account in Database...</span>
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                    <UserPlus size={17} />
                    <span>Create Account</span>
                  </span>
                )}
              </button>

              <div style={{
                textAlign: 'center',
                marginTop: '1.25rem',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)'
              }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Sign In here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
