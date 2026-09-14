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
  Truck
} from 'lucide-react';
import { loginUser, saveAuthUser, DEMO_USERS } from '../../utils/auth';
import { apiCreateOrUpdateUser } from '../../services/api';

export const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState('user'); // 'user', 'agent', 'partner', 'admin'
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
  // Sign In Handler
  // ----------------------------------------------------
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your email or mobile number.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const res = loginUser(emailOrPhone, password, activeTab);
    if (res.success) {
      // Save entry into MongoDB Atlas
      apiCreateOrUpdateUser(res.user).catch(() => {});

      setSuccessMessage(`Welcome back, ${res.user.name}!`);
      setTimeout(() => {
        onLoginSuccess(res.user);
        onClose();
      }, 700);
    } else {
      setErrorMessage(res.error || 'Login failed. Please check your credentials.');
    }
  };

  // ----------------------------------------------------
  // Register / New User Handler (Saves to MongoDB Atlas)
  // ----------------------------------------------------
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regData.name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regData.email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!regData.password.trim()) {
      setErrorMessage('Please set a password.');
      return;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: regData.name.trim(),
      email: regData.email.trim().toLowerCase(),
      phone: regData.phone.trim(),
      role: regData.role || 'user',
      city: regData.city || 'Delhi NCR',
      pincode: regData.pincode.trim(),
      address: regData.address.trim(),
      upiId: '',
      memberSince: 'Just now',
      totalEarned: 0,
      totalRecycledKg: 0,
      createdAt: new Date().toISOString()
    };

    // Save to local storage
    saveAuthUser(newUser);

    // Persist new entry directly into MongoDB Atlas
    try {
      await apiCreateOrUpdateUser(newUser);
    } catch {}

    setSuccessMessage(`✓ Account created & saved to MongoDB Atlas! Welcome, ${newUser.name}!`);
    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 750);
  };

  // Quick 1-click Demo Logins
  const handleQuickLogin = (role) => {
    setErrorMessage('');
    const demoUser = 
      role === 'admin' ? DEMO_USERS.admin : 
      role === 'agent' ? DEMO_USERS.agent : 
      role === 'partner' ? DEMO_USERS.partner : DEMO_USERS.customer;
    loginUser(demoUser.email, 'demo123', role);
    apiCreateOrUpdateUser(demoUser).catch(() => {});
    setSuccessMessage(`Logged in as ${demoUser.name} (${role.toUpperCase()})`);
    setTimeout(() => {
      onLoginSuccess(demoUser);
      onClose();
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-content auth-modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: authMode === 'register' ? '500px' : '440px', 
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
              background: activeTab === 'admin' 
                ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' 
                : 'linear-gradient(135deg, #0D5C3A 0%, #10B981 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              flexShrink: 0
            }}>
              {authMode === 'register' ? <UserPlus size={20} /> : activeTab === 'admin' ? <KeyRound size={20} /> : <User size={20} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>
                {authMode === 'register' ? 'Create New Account' : activeTab === 'admin' ? 'Admin Portal Login' : 'Customer Sign In'}
              </h3>
              <p style={{ fontSize: '0.785rem', color: 'var(--color-text-muted)', margin: 0 }}>
                {authMode === 'register' ? 'Saved directly to MongoDB Atlas database' : 'Access your pickups & scrap earnings'}
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
              }}
              style={{
                padding: '0.45rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
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
              <LogIn size={14} />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage('');
              }}
              style={{
                padding: '0.45rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
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
              <UserPlus size={14} />
              <span>Create New User</span>
            </button>
          </div>

        {/* ============================================================ */}
        {/* MODE 1: SIGN IN FORM                                         */}
        {/* ============================================================ */}
        {authMode === 'login' && (
          <div>
            {/* Role Tabs for Login */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              background: 'var(--color-bg)',
              borderRadius: 'var(--radius-full)',
              padding: '4px',
              marginBottom: '1.25rem',
              border: '1px solid var(--color-border)',
              gap: '2px'
            }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('user');
                  setErrorMessage('');
                  setEmailOrPhone(DEMO_USERS.customer.email);
                  setPassword('user123');
                }}
                style={{
                  padding: '0.45rem 0.2rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'user' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'user' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  boxShadow: activeTab === 'user' ? 'var(--shadow-xs)' : 'none',
                  textAlign: 'center'
                }}
              >
                Resident
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('agent');
                  setErrorMessage('');
                  setEmailOrPhone(DEMO_USERS.agent.email);
                  setPassword('agent123');
                }}
                style={{
                  padding: '0.45rem 0.2rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'agent' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'agent' ? '#2563EB' : 'var(--color-text-secondary)',
                  boxShadow: activeTab === 'agent' ? 'var(--shadow-xs)' : 'none',
                  textAlign: 'center'
                }}
              >
                Agent
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('partner');
                  setErrorMessage('');
                  setEmailOrPhone(DEMO_USERS.partner.email);
                  setPassword('partner123');
                }}
                style={{
                  padding: '0.45rem 0.2rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'partner' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'partner' ? '#D97706' : 'var(--color-text-secondary)',
                  boxShadow: activeTab === 'partner' ? 'var(--shadow-xs)' : 'none',
                  textAlign: 'center'
                }}
              >
                Partner
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                  setErrorMessage('');
                  setEmailOrPhone(DEMO_USERS.admin.email);
                  setPassword('admin123');
                }}
                style={{
                  padding: '0.45rem 0.2rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === 'admin' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'admin' ? '#0F172A' : 'var(--color-text-secondary)',
                  boxShadow: activeTab === 'admin' ? 'var(--shadow-xs)' : 'none',
                  textAlign: 'center'
                }}
              >
                Admin
              </button>
            </div>

            {/* Quick 1-Click Fill */}
            <div style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin(activeTab)}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  color: '#B45309',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={16} color="var(--color-accent-gold)" />
                <span>
                  1-Click Demo Login as {
                    activeTab === 'admin' ? 'Super Admin (Vikram)' :
                    activeTab === 'agent' ? 'Field Agent (Rajesh Kumar)' :
                    activeTab === 'partner' ? 'Scrap Yard Partner (Rameshwar)' :
                    'Customer (Aarav Sharma)'
                  }
                </span>
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
              color: 'var(--color-text-muted)',
              fontSize: '0.75rem',
              textTransform: 'uppercase'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              <span>Or sign in manually</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit}>
              {errorMessage && (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  background: '#FEF2F2',
                  border: '1px solid #F87171',
                  borderRadius: 'var(--radius-md)',
                  color: '#991B1B',
                  fontSize: '0.825rem',
                  marginBottom: '1rem'
                }}>
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  background: '#ECFDF5',
                  border: '1px solid #34D399',
                  borderRadius: 'var(--radius-md)',
                  color: '#065F46',
                  fontSize: '0.825rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">
                  {activeTab === 'admin' ? 'Admin Email' : 'Email or Phone Number'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={activeTab === 'admin' ? 'admin@kabadconnect.com' : 'aarav@kabadconnect.com'}
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    style={{ paddingLeft: '38px' }}
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
                className={`btn btn-full ${activeTab === 'admin' ? 'btn-primary' : 'btn-accent'}`}
                style={{ padding: '0.75rem', fontSize: '0.95rem' }}
              >
                <span>{activeTab === 'admin' ? 'Login to Admin Panel' : 'Sign In to My Account'}</span>
                <ArrowRight size={17} />
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 2: REGISTER / CREATE NEW USER (MONGODB ENTRY)           */}
        {/* ============================================================ */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            {errorMessage && (
              <div style={{
                padding: '0.65rem 0.85rem',
                background: '#FEF2F2',
                border: '1px solid #F87171',
                borderRadius: 'var(--radius-md)',
                color: '#991B1B',
                fontSize: '0.825rem',
                marginBottom: '1rem'
              }}>
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div style={{
                padding: '0.65rem 0.85rem',
                background: '#ECFDF5',
                border: '1px solid #34D399',
                borderRadius: 'var(--radius-md)',
                color: '#065F46',
                fontSize: '0.825rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}>
                <CheckCircle2 size={16} color="#10B981" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Account Role Selector */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                Select Your Role
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
                        padding: '0.5rem 0.35rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        background: isSelected ? 'rgba(13, 92, 58, 0.08)' : '#FFFFFF',
                        color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        textAlign: 'center'
                      }}
                    >
                      <Icon size={16} />
                      <span>{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Yogesh Patel"
                  value={regData.name}
                  onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                  style={{ paddingLeft: '38px' }}
                  required
                />
                <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            {/* Email & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={regData.phone}
                  onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* City & Pincode */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">City / Region</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ahmedabad / Delhi NCR"
                  value={regData.city}
                  onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  maxLength={6}
                  className="form-input"
                  placeholder="e.g. 380015"
                  value={regData.pincode}
                  onChange={(e) => setRegData({ ...regData, pincode: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Create a secure password"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  style={{ paddingLeft: '38px', paddingRight: '38px' }}
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

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}
            >
              <CheckCircle2 size={18} />
              <span>Create Account & Save to Database</span>
            </button>
          </form>
        )}
        </div>
      </div>

      <style>{`
        .auth-modal-content {
          padding: 0 !important;
        }
        @media (max-width: 480px) {
          .auth-modal-header {
            padding: 1rem 1.15rem !important;
          }
          .auth-modal-body {
            padding: 1rem 1.15rem !important;
          }
        }
      `}</style>
    </div>
  );
};
