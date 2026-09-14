import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Sparkles, 
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
  Database
} from 'lucide-react';
import { loginUser, registerUser } from '../../utils/auth';

export const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  if (!isOpen) return null;

  // ----------------------------------------------------
  // Sign In Handler (Authenticates with MongoDB Atlas)
  // ----------------------------------------------------
  const handleLoginSubmit = async (e) => {
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
        setErrorMessage(res.error || 'Invalid credentials. Please check your email/phone and password.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your database connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // Register / New User Handler (Direct MongoDB Atlas Persistence)
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
    if (!regData.password.trim()) {
      setErrorMessage('Please set a password (min 6 characters).');
      return;
    }
    if (regData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser(regData);
      if (res.success && res.user) {
        setSuccessMessage(`✓ Account created & saved to MongoDB database! Welcome, ${res.user.name}!`);
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
          maxWidth: authMode === 'register' ? '520px' : '440px', 
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
              <p style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Database size={12} color="#10B981" />
                <span>Backed directly by MongoDB Atlas database</span>
              </p>
            </div>
          </div>

          <button onClick={onClose} className="modal-close-btn" aria-label="Close login modal">
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
          {/* Mode Switcher: Sign In vs Create Account */}
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
              <span>Create New User</span>
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
              lineHeight: 1.4
            }}>
              {errorMessage}
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
              alignItems: 'center',
              gap: '0.45rem',
              lineHeight: 1.4
            }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODE 1: SIGN IN FORM                                         */}
          {/* ============================================================ */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit}>
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
                    <span>Verifying with MongoDB Atlas...</span>
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                    <span>Sign In</span>
                    <ArrowRight size={17} />
                  </span>
                )}
              </button>

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
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* MODE 2: REGISTER / CREATE NEW USER                           */}
          {/* ============================================================ */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit}>
              {/* Account Role Selector */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  Select Account Role
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { role: 'user', label: 'Resident / Customer', icon: User },
                    { role: 'agent', label: 'Field Executive', icon: Truck },
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
                          padding: '0.55rem 0.35rem',
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
                          gap: '0.25rem',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Icon size={18} color={isSelected ? 'var(--color-primary)' : '#64748B'} />
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Name */}
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
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

              {/* Email & Phone Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="you@domain.com"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      style={{ paddingLeft: '36px' }}
                      required
                    />
                    <Mail size={15} color="#94A3B8" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

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
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label">Set Password * (min 6 chars)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Create a strong password"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    style={{ paddingLeft: '38px', paddingRight: '38px' }}
                    minLength={6}
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
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* City & Pincode */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
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

              {/* Address */}
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
                    <span>Saving to MongoDB Atlas Database...</span>
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                    <UserPlus size={17} />
                    <span>Create Account & Save in MongoDB</span>
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
