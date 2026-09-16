import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Truck, 
  Scale, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  ArrowRight, 
  ExternalLink, 
  QrCode, 
  Navigation, 
  Battery, 
  Cpu, 
  Box, 
  FileText, 
  Check, 
  DollarSign, 
  ArrowLeft, 
  RefreshCw, 
  Star, 
  Building2, 
  Briefcase, 
  ChevronRight, 
  Sparkles,
  TrendingUp,
  Leaf,
  Layers,
  FileCheck,
  Lock,
  KeyRound,
  LogOut,
  Locate,
  Loader2,
  Compass,
  Wallet
} from 'lucide-react';
import { DEMO_USERS } from '../utils/auth';
import { fetchLocationByPincode, detectCurrentLocationWithAddress } from '../utils/geolocation';

export const ProfilePage = ({
  currentUser,
  onUpdateUser,
  orders = [],
  onCancelOrder,
  onReorder,
  onUpdateOrder,
  onOpenBooking,
  onOpenAuth,
  onOpenAdminPanel,
  onLogout,
  onNavigate
}) => {
  // ----------------------------------------------------
  // Strict Role-Based Privacy & Access Control (RBAC)
  // Non-admin users can ONLY view their own profile.
  // Super Admin (role === 'admin') has Audit Mode privileges.
  // ----------------------------------------------------
  const userRole = currentUser?.role || 'user';
  const [adminAuditRoleView, setAdminAuditRoleView] = useState('admin');
  const activeRoleView = userRole === 'admin' ? adminAuditRoleView : userRole;

  // Edit Profile Modal State with Live Location & Postal Pincode Auto-fetch
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || 'Delhi NCR',
    state: currentUser?.state || '',
    pincode: currentUser?.pincode || '',
    upiId: currentUser?.upiId || ''
  });

  // Filter orders strictly for the active user (excluding any legacy demo IDs)
  const userOrders = currentUser 
    ? orders.filter(o => {
        if (['KC-7729', 'KC-7681', 'KC-DEMO-1', 'KC-DEMO-2', 'KC-8842', 'KC-8721'].includes(o.id)) return false;
        if (o.userId && o.userId === currentUser.id) return true;
        if (currentUser.email && o.customer?.email && o.customer.email.toLowerCase() === currentUser.email.toLowerCase()) return true;
        if (currentUser.phone && o.customer?.phone && o.customer.phone === currentUser.phone) return true;
        if (currentUser.role === 'admin') return true;
        return false;
      })
    : [];

  // ----------------------------------------------------
  // Dynamic Calculation of Completed Scrap Orders & Wallet
  // ----------------------------------------------------
  const completedOrders = userOrders.filter(o => 
    o.status === 'completed' || 
    o.doorstepVerification?.paymentStatus === 'paid' || 
    o.doorstepVerification?.paymentStatus === 'completed' ||
    o.paymentStatus === 'paid'
  );

  const dynamicOrdersEarned = completedOrders.reduce((acc, o) => {
    const amt = parseFloat(o.paidAmount || o.totalPaid || o.doorstepVerification?.paidAmount || o.doorstepVerification?.finalAmount || o.estimatedAmount || 0);
    return acc + (isNaN(amt) ? 0 : amt);
  }, 0);

  const dynamicOrdersRecycledKg = completedOrders.reduce((acc, o) => {
    const kg = parseFloat(o.doorstepVerification?.verifiedWeight || o.actualWeight || o.totalWeight || o.estimatedWeight || 0);
    return acc + (isNaN(kg) ? 0 : kg);
  }, 0);

  // Dynamic wallet amount: if user explicitly configured walletBalance or totalEarned, use that combined with orders
  const displayWalletEarned = currentUser?.walletBalance !== undefined && currentUser?.walletBalance !== null
    ? Number(currentUser.walletBalance)
    : (Number(currentUser?.totalEarned || 0) + dynamicOrdersEarned);

  const displayTotalRecycled = Number(currentUser?.totalRecycledKg || 0) + dynamicOrdersRecycledKg;
  const displayCo2Avoided = currentUser?.co2SavedKg ? currentUser.co2SavedKg : (displayTotalRecycled * 1.85).toFixed(1);
  const displayTreesPreserved = currentUser?.treesSaved ? currentUser.treesSaved : (displayTotalRecycled / 58).toFixed(1);

  // Wallet Management / Set Amount Modal State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletAmountInput, setWalletAmountInput] = useState('');
  const [walletScrapKgInput, setWalletScrapKgInput] = useState('');
  const [walletSaveStatus, setWalletSaveStatus] = useState('');

  const handleOpenWalletModal = () => {
    setWalletAmountInput(String(displayWalletEarned));
    setWalletScrapKgInput(String(displayTotalRecycled));
    setWalletSaveStatus('');
    setIsWalletModalOpen(true);
  };

  const handleSaveWalletData = async (e) => {
    if (e) e.preventDefault();
    const parsedAmount = Math.max(0, parseFloat(walletAmountInput) || 0);
    const parsedKg = Math.max(0, parseFloat(walletScrapKgInput) || 0);
    const calculatedCo2 = (parsedKg * 1.85).toFixed(1);
    const calculatedTrees = (parsedKg / 58).toFixed(1);

    const updatedUser = {
      ...currentUser,
      walletBalance: parsedAmount,
      totalEarned: parsedAmount,
      totalRecycledKg: parsedKg,
      co2SavedKg: calculatedCo2,
      treesSaved: calculatedTrees
    };

    if (onUpdateUser) {
      await onUpdateUser(updatedUser);
    }
    setWalletSaveStatus('✓ Wallet amount and scrap metrics updated successfully!');
    setTimeout(() => {
      setIsWalletModalOpen(false);
      setWalletSaveStatus('');
    }, 850);
  };

  // ----------------------------------------------------
  // Certificate PDF Download / Print Generator
  // ----------------------------------------------------
  const handleDownloadCertificate = () => {
    const certId = `KC-CERT-${currentUser?.id ? String(currentUser.id).slice(-6).toUpperCase() : '2026-IND'}`;
    const certName = currentUser?.name || 'Verified Member';
    const certKg = displayTotalRecycled;
    const certCo2 = displayCo2Avoided;
    const certTrees = displayTreesPreserved;
    const issueDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const printWindow = window.open('', '_blank', 'width=920,height=700');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups for this browser tab to view and download your PDF certificate.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${certName} - Green Landfill Diversion Certificate (${certId})</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #F8FAFC;
            color: #0F172A;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 30px;
          }
          .cert-card {
            width: 860px;
            background: #FFFFFF;
            border: 10px solid #0D5C3A;
            border-radius: 24px;
            padding: 40px;
            position: relative;
            box-shadow: 0 25px 50px -12px rgba(13, 92, 58, 0.15);
          }
          .inner-wrapper {
            border: 2px dashed #10B981;
            border-radius: 16px;
            padding: 35px;
            background: linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #E2E8F0;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .tag {
            font-size: 11px;
            font-weight: 800;
            color: #059669;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .title {
            font-size: 30px;
            font-weight: 900;
            color: #072E1C;
            margin-top: 4px;
          }
          .meta {
            font-size: 13px;
            color: #64748B;
            margin-top: 4px;
          }
          .body-text {
            font-size: 16px;
            line-height: 1.85;
            color: #334155;
            margin-bottom: 30px;
          }
          .body-text strong {
            color: #0D5C3A;
            font-weight: 800;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 30px;
          }
          .stat-box {
            background: #FFFFFF;
            border: 1.5px solid #A7F3D0;
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.08);
          }
          .stat-val {
            font-size: 26px;
            font-weight: 900;
            color: #0D5C3A;
          }
          .stat-lbl {
            font-size: 11px;
            font-weight: 800;
            color: #059669;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 4px;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-top: 1.5px solid #E2E8F0;
            padding-top: 20px;
          }
          .badge {
            font-size: 12px;
            font-weight: 800;
            color: #059669;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .sig-box {
            text-align: right;
          }
          .sig-title {
            font-size: 11px;
            font-weight: 700;
            color: #64748B;
            margin-top: 2px;
          }
          .top-bar {
            position: fixed;
            top: 15px;
            right: 20px;
            z-index: 1000;
            display: flex;
            gap: 10px;
          }
          .print-btn {
            background: #10B981;
            color: #FFFFFF;
            border: none;
            padding: 10px 22px;
            font-weight: 800;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
            transition: all 0.2s ease;
          }
          .print-btn:hover {
            background: #059669;
            transform: translateY(-1px);
          }
          @media print {
            body { background: #FFFFFF; padding: 0; }
            .cert-card { box-shadow: none; width: 100%; border-width: 6px; }
            .top-bar { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="top-bar">
          <button class="print-btn" onclick="window.print()">
            🖨️ Save as PDF / Print Certificate
          </button>
        </div>

        <div class="cert-card">
          <div class="inner-wrapper">
            <div class="header">
              <div>
                <div class="tag">KabadCollect Circular Economy Initiative</div>
                <div class="title">Green Landfill Diversion Certificate</div>
                <div class="meta">Certificate ID: <strong>${certId}</strong> • Issued: <strong>${issueDate}</strong></div>
              </div>
              <div style="text-align: center; background: #FFFFFF; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #E2E8F0;">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#0D5C3A" stroke-width="2.2">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <path d="M14 14h3v3h-3zM18 18h3v3h-3z"/>
                </svg>
                <div style="font-size: 8px; font-weight: 800; color: #64748B; margin-top: 3px; letter-spacing: 0.5px;">SCAN TO VERIFY</div>
              </div>
            </div>

            <div class="body-text">
              This certifies that <strong>${certName}</strong> has segregated and responsibly recycled <strong>${certKg} kg of household & office scrap</strong> through KabadCollect's verified hyperlocal recycling network, preventing <strong>${certCo2} kg of CO₂ greenhouse emissions</strong> and conserving <strong>${certTrees} mature forest trees</strong>.
            </div>

            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-val">${certKg} kg</div>
                <div class="stat-lbl">Scrap Recycled</div>
              </div>
              <div class="stat-box">
                <div class="stat-val">${certCo2} kg</div>
                <div class="stat-lbl">CO₂ Emissions Avoided</div>
              </div>
              <div class="stat-box">
                <div class="stat-val">${certTrees}</div>
                <div class="stat-lbl">Trees Preserved</div>
              </div>
            </div>

            <div class="footer">
              <div class="badge">
                ✓ Ministry of Environment & Climate Benchmarking Compliant
              </div>
              <div class="sig-box">
                <div style="font-size: 15px; font-weight: 900; color: #0D5C3A; text-decoration: underline;">KabadCollect Verification Board</div>
                <div class="sig-title">Digital Hyperlocal Ecosystem Certificate</div>
              </div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState(null); // { type: 'success'|'error'|'loading', message: string, postOffices?: [] }
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');

  // Sync edit form with currentUser whenever modal opens or user profile changes
  useEffect(() => {
    if (currentUser) {
      setEditFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        pincode: currentUser.pincode || '',
        upiId: currentUser.upiId || ''
      });
      setPincodeStatus(null);
      setLocationSuccessMsg('');
    }
  }, [currentUser, isEditModalOpen]);

  // Live Pincode Auto-fetch Handler
  const handlePincodeChange = async (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setEditFormData(prev => ({ ...prev, pincode: clean }));

    if (clean.length === 6) {
      setIsFetchingPincode(true);
      setPincodeStatus({ type: 'loading', message: 'Fetching city & state from postal database...' });
      try {
        const res = await fetchLocationByPincode(clean);
        if (res.success) {
          setEditFormData(prev => ({
            ...prev,
            city: res.city || prev.city,
            state: res.state || prev.state,
            // Pre-fill or append area if address is empty
            address: (!prev.address || prev.address.trim().length === 0) && res.area ? res.area : prev.address
          }));
          setPincodeStatus({
            type: 'success',
            message: `✓ ${res.area ? res.area + ', ' : ''}${res.city}, ${res.state}`,
            city: res.city,
            state: res.state,
            area: res.area,
            postOffices: res.postOffices || []
          });
        } else {
          setPincodeStatus({
            type: 'error',
            message: res.message || 'Pincode not found.'
          });
        }
      } catch (err) {
        setPincodeStatus({
          type: 'error',
          message: 'Could not resolve pincode details.'
        });
      } finally {
        setIsFetchingPincode(false);
      }
    } else {
      setPincodeStatus(null);
    }
  };

  // GPS Current Location Detection Handler
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationSuccessMsg('');
    try {
      const token = import.meta.env.VITE_MAPBOX_TOKEN || '';
      const geo = await detectCurrentLocationWithAddress(token);
      if (geo && geo.success) {
        setEditFormData(prev => ({
          ...prev,
          address: geo.address || prev.address,
          city: geo.city || prev.city,
          state: geo.state || prev.state,
          pincode: geo.pincode || prev.pincode
        }));

        const locSummary = [geo.locality || geo.address, geo.city, geo.state, geo.pincode].filter(Boolean).join(', ');
        setLocationSuccessMsg(`✓ Current location detected: ${locSummary}`);
        setPincodeStatus({
          type: 'success',
          message: `✓ GPS: ${geo.city}${geo.state ? ', ' + geo.state : ''}${geo.pincode ? ` (${geo.pincode})` : ''}`
        });
        showFeedback('Current location, city, state & address pre-filled!');
      }
    } catch (err) {
      alert(`Location notice: ${err.message || 'Unable to fetch GPS position. Please enable browser location permissions.'}`);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Customer sub-tab state
  const [customerTab, setCustomerTab] = useState('pickups'); // 'pickups' | 'addresses' | 'payments' | 'certificate'

  // Agent State (Duty Status Toggle & Route status)
  const [agentDutyStatus, setAgentDutyStatus] = useState('Online');
  const [assignedRoutes, setAssignedRoutes] = useState(DEMO_USERS.agent.assignedRoutes);

  // Partner State (Commodity Pricing & Yard Capacity)
  const [yardStock, setYardStock] = useState(DEMO_USERS.partner.currentStockTons);

  // Notification / Toast Feedback
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const showFeedback = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  // Save profile edits
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      ...editFormData
    };
    onUpdateUser(updated);
    setIsEditModalOpen(false);
    showFeedback('Profile updated successfully with location & address!');
  };

  // Toggle Agent Duty
  const toggleAgentDuty = () => {
    const next = agentDutyStatus === 'Online' ? 'Offline' : 'Online';
    setAgentDutyStatus(next);
    showFeedback(`Agent status updated to: ${next}`);
  };

  // Mark Agent Task Status
  const handleUpdateTaskStatus = (taskId, newStatus) => {
    setAssignedRoutes(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    showFeedback(`Pickup ${taskId} status updated to ${newStatus}`);
  };

  // Role Header Information generator
  const getRoleHeaderInfo = () => {
    switch (activeRoleView) {
      case 'agent':
        return {
          badgeIcon: <Truck size={13} />,
          badgeText: 'Field Collection Agent • Operational Hub',
          title: 'Field Agent Operational Profile',
          desc: 'Manage your assigned doorstep pickup routes, electric vehicle payload, certified digital scale status, and earnings.'
        };
      case 'partner':
        return {
          badgeIcon: <Building2 size={13} />,
          badgeText: 'Recycling Merchant Facility • Wholesale Hub',
          title: 'Scrap Yard Partner Profile',
          desc: 'Manage wholesale yard capacity, direct mill offtake agreements, commercial RTGS settlement accounts, and cargo fleet.'
        };
      case 'admin':
        return {
          badgeIcon: <ShieldCheck size={13} />,
          badgeText: 'Root System Access • Super Administrator',
          title: 'Platform Administrator Hub',
          desc: 'Centralized administrative oversight, real-time rate card governance, merchant verification, and cross-role audit tools.'
        };
      case 'user':
      default:
        return {
          badgeIcon: <ShieldCheck size={13} />,
          badgeText: 'Verified Resident Account • Hyperlocal Network',
          title: 'My Customer Profile',
          desc: 'Manage your doorstep pickup requests, saved collection addresses, verified UPI payout preferences, and eco-impact certificates.'
        };
    }
  };

  const headerInfo = getRoleHeaderInfo();

  // ----------------------------------------------------
  // GUEST / UNRESTRICTED ACCESS SHIELD
  // If user is not logged in, DO NOT leak any personal data
  // ----------------------------------------------------
  if (!currentUser) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '85vh', paddingBottom: '5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #072e1c 0%, #0D5C3A 60%, #10B981 100%)',
          color: '#FFFFFF',
          padding: '2.5rem 1.5rem 2.25rem 1.5rem',
          position: 'relative'
        }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '1rem' }}>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255, 255, 255, 0.85)', cursor: 'pointer', padding: 0 }}
              >
                Home
              </button>
              <span>/</span>
              <span style={{ color: '#34D399', fontWeight: 700 }}>Profile & Account</span>
            </div>
            <h1 style={{ color: '#FFFFFF', fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, margin: 0 }}>
              Profile Access Restricted
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: '0.5rem 0 0 0', fontSize: '1rem' }}>
              Privacy-Protected Hyperlocal Recycling Network
            </p>
          </div>
        </div>

        <div className="container" style={{ maxWidth: '580px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem 2rem',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(13, 92, 58, 0.08)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <Lock size={32} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
              Confidential Profile
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              To maintain strict data confidentiality, scrap pickup transactions and financial earnings are visible only to verified account owners. Please sign in to view your profile.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onOpenAuth}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
              >
                <User size={16} /> Sign In to Your Profile
              </button>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="btn btn-outline"
                style={{ padding: '0.75rem 1.25rem' }}
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '85vh', paddingBottom: '5rem' }}>
      {/* 1. Page Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #072e1c 0%, #0D5C3A 60%, #10B981 100%)',
        color: '#FFFFFF',
        padding: '2.5rem 1.5rem 2.25rem 1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle decorative circles */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.1)',
          pointerEvents: 'none'
        }} />

        <div className="container">
          {/* Breadcrumbs & Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.85)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8rem'
                }}
              >
                <ArrowLeft size={14} /> Home
              </button>
              <span>/</span>
              <span style={{ color: '#34D399', fontWeight: 700 }}>Profile & Account Control</span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="btn btn-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)'
              }}
            >
              <ArrowLeft size={13} /> Return to Main Page
            </button>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(16, 185, 129, 0.25)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            color: '#34D399',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem'
          }}>
            {headerInfo.badgeIcon} {headerInfo.badgeText}
          </div>

          <h1 style={{
            color: '#FFFFFF',
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '0.75rem',
            maxWidth: '820px'
          }}>
            {headerInfo.title}
          </h1>

          <p style={{
            fontSize: '1.05rem',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '720px',
            lineHeight: 1.6,
            marginBottom: '0'
          }}>
            {headerInfo.desc}
          </p>
        </div>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10, paddingTop: '1.75rem' }}>
        {/* Feedback notification toast */}
        {feedbackMessage && (
          <div style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1.25rem',
            background: '#0D5C3A',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            animation: 'fadeIn 0.2s ease'
          }}>
            <CheckCircle2 size={18} color="#34D399" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* 2. Strict Privacy Reassurance Banner */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          padding: '0.85rem 1.25rem',
          boxShadow: 'var(--shadow-xs)',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                End-to-End Privacy Protected Profile
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Displaying confidential profile for <strong>{currentUser.name}</strong> ({
                  currentUser.role === 'admin' ? 'Super Administrator' :
                  currentUser.role === 'agent' ? 'Field Pickup Executive' :
                  currentUser.role === 'partner' ? 'Recycling Partner' : 'Resident Customer'
                }). Data is isolated and restricted to your account.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.785rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                title="Sign in with a different role account"
              >
                <KeyRound size={13} /> Switch Account
              </button>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.785rem', color: '#DC2626', borderColor: '#FCA5A5' }}
              >
                <LogOut size={13} /> Logout
              </button>
            )}
          </div>
        </div>

        {/* 3. Super Admin Audit Mode Bar (VISIBLE ONLY TO SUPER ADMIN) */}
        {userRole === 'admin' && (
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            border: '1.5px solid #F59E0B',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} color="#F59E0B" />
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#F59E0B' }}>
                  Super Admin Audit Mode (Platform Inspection)
                </span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                  As Administrator, you can audit how each role presents their workspace.
                </span>
              </div>
              {onOpenAdminPanel && (
                <button
                  type="button"
                  onClick={onOpenAdminPanel}
                  className="btn btn-sm"
                  style={{
                    background: '#F59E0B',
                    color: '#0F172A',
                    fontWeight: 800,
                    fontSize: '0.775rem',
                    border: 'none',
                    padding: '0.35rem 0.85rem'
                  }}
                >
                  Open Admin Control Room
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setAdminAuditRoleView('admin')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: adminAuditRoleView === 'admin' ? '2px solid #F59E0B' : '1px solid rgba(255,255,255,0.2)',
                  background: adminAuditRoleView === 'admin' ? '#F59E0B' : 'rgba(255,255,255,0.05)',
                  color: adminAuditRoleView === 'admin' ? '#0F172A' : '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Admin Profile
              </button>
              <button
                type="button"
                onClick={() => setAdminAuditRoleView('user')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: adminAuditRoleView === 'user' ? '2px solid #10B981' : '1px solid rgba(255,255,255,0.2)',
                  background: adminAuditRoleView === 'user' ? '#10B981' : 'rgba(255,255,255,0.05)',
                  color: adminAuditRoleView === 'user' ? '#FFFFFF' : '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Audit Customer View
              </button>
              <button
                type="button"
                onClick={() => setAdminAuditRoleView('agent')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: adminAuditRoleView === 'agent' ? '2px solid #3B82F6' : '1px solid rgba(255,255,255,0.2)',
                  background: adminAuditRoleView === 'agent' ? '#3B82F6' : 'rgba(255,255,255,0.05)',
                  color: adminAuditRoleView === 'agent' ? '#FFFFFF' : '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Audit Field Agent View
              </button>
              <button
                type="button"
                onClick={() => setAdminAuditRoleView('partner')}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: adminAuditRoleView === 'partner' ? '2px solid #F59E0B' : '1px solid rgba(255,255,255,0.2)',
                  background: adminAuditRoleView === 'partner' ? '#F59E0B' : 'rgba(255,255,255,0.05)',
                  color: adminAuditRoleView === 'partner' ? '#0F172A' : '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Audit Scrap Yard Partner View
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ROLE 1: CUSTOMER / USER PROFILE VIEW                         */}
        {/* ============================================================ */}
        {activeRoleView === 'user' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* User Hero Identity Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <img
                    src={currentUser?.role === 'user' ? (currentUser?.avatar || DEMO_USERS.customer.avatar) : DEMO_USERS.customer.avatar}
                    alt="Customer Avatar"
                    style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-accent-mint)' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                        {currentUser?.name || 'Member'}
                      </h2>
                      <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={13} /> Verified Resident
                      </span>
                      <span className="badge badge-neutral" style={{ background: '#FEF3C7', color: '#92400E', fontWeight: 700 }}>
                        {currentUser?.totalRecycledKg > 100 ? '🌱 Platinum Green Guardian' : currentUser?.totalRecycledKg > 25 ? '🌿 Silver Green Guardian' : '🌱 New Eco Contributor'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={14} /> {currentUser?.email || 'No email set'}
                      </span>
                      {currentUser?.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={14} /> {currentUser.phone}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} /> {
                          (() => {
                            const parts = [currentUser?.city, currentUser?.state].filter(Boolean).join(', ');
                            return `${parts || 'Delhi NCR'}${currentUser?.pincode ? ` (${currentUser.pincode})` : ''}`;
                          })()
                        }
                      </span>
                    </div>

                    <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                      <strong>Primary Address:</strong> {currentUser?.address || 'No address set'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const usr = currentUser?.role === 'user' ? currentUser : DEMO_USERS.customer;
                      setEditFormData({
                        name: usr?.name || '',
                        email: usr?.email || '',
                        phone: usr?.phone || '',
                        address: usr?.address || '',
                        city: usr?.city || '',
                        state: usr?.state || '',
                        pincode: usr?.pincode || '',
                        upiId: usr?.upiId || ''
                      });
                      setPincodeStatus(usr?.pincode ? {
                        type: 'success',
                        message: `✓ ${[usr?.city, usr?.state].filter(Boolean).join(', ')} (${usr.pincode})`
                      } : null);
                      setLocationSuccessMsg('');
                      setIsEditModalOpen(true);
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Edit3 size={15} /> Edit Profile
                  </button>

                  <button
                    type="button"
                    onClick={onOpenBooking}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Plus size={15} /> Book Doorstep Pickup
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Green Impact Metrics (Dynamically calculated from pickups & wallet) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem'
            }}>
              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Total Cash Earned
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={handleOpenWalletModal}
                      style={{
                        padding: '0.22rem 0.6rem',
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        color: '#059669',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'all 0.2s ease'
                      }}
                      title="Set custom wallet cash amount or add balance"
                    >
                      <Edit3 size={11} /> Set Amount
                    </button>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Wallet size={18} />
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  ₹{displayWalletEarned.toLocaleString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-mint)', fontWeight: 600 }}>
                    Instant digital UPI settlement
                  </span>
                  {completedOrders.length > 0 && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      ({completedOrders.length} {completedOrders.length === 1 ? 'pickup' : 'pickups'})
                    </span>
                  )}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Scrap Recycled
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scale size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B' }}>
                  {displayTotalRecycled} kg
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                  Diverted from city landfills
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    CO₂ Emissions Avoided
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(13, 92, 58, 0.12)', color: '#0D5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Leaf size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0D5C3A' }}>
                  {displayCo2Avoided} kg
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                  Clean air impact
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Trees Preserved
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#B45309' }}>
                  {displayTreesPreserved} Trees
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                  From paper & cardboard recycling
                </div>
              </div>
            </div>

            {/* Customer Sub Tabs Navigation */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              borderBottom: '2px solid var(--color-border)',
              paddingBottom: '0.25rem'
            }}>
              <button
                type="button"
                onClick={() => setCustomerTab('pickups')}
                style={{
                  padding: '0.65rem 1.25rem',
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: customerTab === 'pickups' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  borderBottom: customerTab === 'pickups' ? '3px solid var(--color-primary)' : '3px solid transparent',
                  cursor: 'pointer'
                }}
              >
                My Pickup Requests ({userOrders.length})
              </button>

              <button
                type="button"
                onClick={() => setCustomerTab('payments')}
                style={{
                  padding: '0.65rem 1.25rem',
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: customerTab === 'payments' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  borderBottom: customerTab === 'payments' ? '3px solid var(--color-primary)' : '3px solid transparent',
                  cursor: 'pointer'
                }}
              >
                Instant UPI & Bank Settlement
              </button>

              <button
                type="button"
                onClick={() => setCustomerTab('addresses')}
                style={{
                  padding: '0.65rem 1.25rem',
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: customerTab === 'addresses' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  borderBottom: customerTab === 'addresses' ? '3px solid var(--color-primary)' : '3px solid transparent',
                  cursor: 'pointer'
                }}
              >
                Saved Addresses
              </button>

              <button
                type="button"
                onClick={() => setCustomerTab('certificate')}
                style={{
                  padding: '0.65rem 1.25rem',
                  border: 'none',
                  background: 'transparent',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: customerTab === 'certificate' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  borderBottom: customerTab === 'certificate' ? '3px solid var(--color-primary)' : '3px solid transparent',
                  cursor: 'pointer'
                }}
              >
                Eco Certificates
              </button>
            </div>

            {/* SubTab 1: Pickups List */}
            {customerTab === 'pickups' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {userOrders.length === 0 ? (
                  <div style={{
                    padding: '3rem 1.5rem',
                    textAlign: 'center',
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px dashed var(--color-border)'
                  }}>
                    <Truck size={40} color="var(--color-text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
                    <h4 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>No Pickup Requests Yet</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                      Schedule your first doorstep scrap pickup and earn instant payout with certified digital weighing.
                    </p>
                    <button onClick={onOpenBooking} className="btn btn-primary btn-sm">
                      Schedule a Pickup Now
                    </button>
                  </div>
                ) : (
                  userOrders.map((order) => {
                    const isCancelled = order.status === 'Cancelled';
                    return (
                      <div
                        key={order.id}
                        style={{
                          background: '#FFFFFF',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.5rem',
                          border: '1px solid var(--color-border)',
                          boxShadow: 'var(--shadow-xs)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                                Pickup #{order.id}
                              </span>
                              <span className={`badge ${
                                order.status === 'Completed' ? 'badge-primary' : 
                                order.status === 'Cancelled' ? 'badge-danger' : 
                                'badge-warning'
                              }`}>
                                {order.status}
                              </span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                Booked on {order.date || 'Recent'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                              <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                              {order.address}, {order.city} ({order.pincode}) • Time Slot: <strong>{order.slot || '10:00 AM - 12:00 PM'}</strong>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                              {order.status === 'completed' ? 'FINAL PAID' : 'ESTIMATED PAYOUT'}
                            </div>
                            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: order.status === 'completed' ? '#059669' : 'var(--color-primary)' }}>
                              ₹{order.status === 'completed' 
                                ? (order.totalPaid || order.doorstepVerification?.paidAmount || order.paidAmount || order.estimatedPayout || order.estimatedAmount || 350)
                                : (order.estimatedPayout || order.estimatedAmount || order.totalEstimated || 350)}
                            </div>
                          </div>
                        </div>

                        {/* Order Items Pills */}
                        <div style={{
                          background: 'var(--color-bg)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.85rem',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                            Scrap Items:
                          </span>
                          {order.items && order.items.length > 0 ? (
                            order.items.map((it, idx) => (
                              <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.775rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                                {it.name || it.item} ({it.estimatedWeight || it.weight || 5}kg)
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                              Mixed household recyclables (~15 kg)
                            </span>
                          )}
                        </div>

                        {/* Actions Row */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              onReorder(order);
                              showFeedback(`Items from #${order.id} added to new booking!`);
                            }}
                            className="btn btn-outline btn-sm"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <RefreshCw size={13} />
                            <span>1-Click Reorder</span>
                          </button>

                          {!isCancelled && order.status !== 'Completed' && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  onCancelOrder(order.id);
                                  showFeedback(`Pickup #${order.id} has been cancelled.`);
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                              >
                                Cancel Request
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* SubTab 2: Payments & UPI */}
            {customerTab === 'payments' && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                border: '1px solid var(--color-border)'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0F172A' }}>
                  Doorstep Payout Preferences
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', maxWidth: '600px' }}>
                  Our verified executives carry certified digital weighing scales. Once weights are locked, money is transferred in seconds directly to your verified UPI ID or Bank account.
                </p>

                <div style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '2px solid var(--color-accent-mint)',
                  background: 'rgba(236, 253, 245, 0.4)',
                  maxWidth: '520px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                      PRIMARY INSTANT UPI ID (ACTIVE)
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                      {currentUser?.upiId || 'Not linked yet (Instant UPI active on order)'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-accent-mint)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <CheckCircle2 size={13} /> Verified by NPCI UPI Gateway
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="btn btn-outline btn-sm"
                  >
                    Change UPI
                  </button>
                </div>
              </div>
            )}

            {/* SubTab 3: Saved Addresses */}
            {customerTab === 'addresses' && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                      Saved Scrap Collection Addresses
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                      Choose your default doorstep location for fast 1-click booking.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus size={14} /> Add New Address
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                  {((currentUser?.savedAddresses && currentUser.savedAddresses.length > 0) ? currentUser.savedAddresses : (currentUser?.address ? [{ id: 'addr-1', label: 'Primary Registered Address', address: currentUser.address, city: currentUser.city || 'Delhi NCR', pincode: currentUser.pincode || '', isDefault: true }] : [])).map((addr) => (
                    <div
                      key={addr.id}
                      style={{
                        border: addr.isDefault ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        background: addr.isDefault ? 'rgba(13, 92, 58, 0.03)' : '#FFFFFF'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>{addr.label}</span>
                        {addr.isDefault && (
                          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>Default</span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                        {addr.address}, {addr.city} - {addr.pincode}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        GPS Verified Sector Area
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SubTab 4: Eco Certificates */}
            {customerTab === 'certificate' && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{
                  border: '3px solid #10B981',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem',
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        KABADCOLLECT CIRCULAR ECONOMY INITIATIVE
                      </div>
                      <h3 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                        Green Landfill Diversion Certificate
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        Certificate ID: <strong>KC-CERT-{currentUser?.id ? currentUser.id.slice(-6).toUpperCase() : '2026-IND'}</strong> • Issued to: <strong>{currentUser?.name || 'Verified Member'}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', background: '#FFFFFF', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      <QrCode size={48} color="var(--color-primary)" />
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)', marginTop: '2px' }}>SCAN TO VERIFY</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '750px' }}>
                    This certifies that <strong>{currentUser?.name || 'Verified Member'}</strong> has segregated and responsibly recycled <strong>{displayTotalRecycled} kg of household & office scrap</strong> through KabadCollect's verified hyperlocal network, preventing <strong>{displayCo2Avoided} kg of CO₂ greenhouse emissions</strong> and conserving <strong>{displayTreesPreserved} mature forest trees</strong>.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', borderTop: '1px dashed #A7F3D0', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                      ✓ Ministry of Environment & Climate Benchmarked
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadCertificate}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                    >
                      <FileCheck size={14} /> Download Verified Certificate (PDF)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* ROLE 2: AGENT / PICKUP EXECUTIVE PROFILE VIEW                */}
        {/* ============================================================ */}
        {activeRoleView === 'agent' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Agent Hero Identity Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <img
                    src={currentUser?.role === 'agent' ? (currentUser?.avatar || DEMO_USERS.agent.avatar) : DEMO_USERS.agent.avatar}
                    alt="Agent Avatar"
                    style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563EB' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                        {currentUser?.role === 'agent' ? currentUser?.name : DEMO_USERS.agent.name}
                      </h2>
                      <span className="badge badge-primary" style={{ background: '#DBEAFE', color: '#1E40AF', fontWeight: 800 }}>
                        Badge #{currentUser?.agentCode || DEMO_USERS.agent.agentCode}
                      </span>
                      <span className="badge badge-primary" style={{ background: '#DCFCE7', color: '#166534', fontWeight: 700 }}>
                        <ShieldCheck size={13} style={{ display: 'inline', marginRight: '3px' }} /> Police Verified
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={14} /> {currentUser?.phone || DEMO_USERS.agent.phone}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} /> {currentUser?.city || DEMO_USERS.agent.city} • Sector 42, 43, 54 Hub
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#D97706', fontWeight: 700 }}>
                        <Star size={14} fill="#D97706" /> {DEMO_USERS.agent.rating} (348 Reviews)
                      </span>
                    </div>

                    <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                      <strong>Vehicle:</strong> {DEMO_USERS.agent.vehicleType} • Reg: <strong>{DEMO_USERS.agent.vehicleRegNo}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Duty Toggle */}
                  <button
                    type="button"
                    onClick={toggleAgentDuty}
                    className={`btn btn-sm ${agentDutyStatus === 'Online' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: agentDutyStatus === 'Online' ? '#059669' : '#64748B',
                      borderColor: agentDutyStatus === 'Online' ? '#059669' : '#64748B'
                    }}
                  >
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: agentDutyStatus === 'Online' ? '#A7F3D0' : '#CBD5E1'
                    }} />
                    <span>Duty Status: {agentDutyStatus}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Agent Operational Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem'
            }}>
              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Today's Earnings
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563EB' }}>
                  ₹{DEMO_USERS.agent.todaysEarnings.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                  Monthly: ₹{DEMO_USERS.agent.monthlyEarnings.toLocaleString()}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Completed Pickups
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>
                  {DEMO_USERS.agent.completedPickups}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                  {DEMO_USERS.agent.onTimeRate} On-Time Arrival
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Vehicle Current Load
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706' }}>
                  {DEMO_USERS.agent.currentPayloadKg} / {DEMO_USERS.agent.maxPayloadKg} kg
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                  28% capacity utilized
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Digital Scale Status
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(13, 92, 58, 0.12)', color: '#0D5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scale size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0D5C3A' }}>
                  Calibrated Today
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                  Cert: {DEMO_USERS.agent.scaleCertificationNo}
                </div>
              </div>
            </div>

            {/* Agent Assigned Routes & Tasks Queue */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                    Today's Assigned Doorstep Route
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Real-time GPS route, customer scrap verification, and digital scale synchronization.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => showFeedback('Refreshed latest pickup assignments.')}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <RefreshCw size={13} /> Refresh Route
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {assignedRoutes.map((task, i) => (
                  <div
                    key={task.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                      background: task.status === 'In Progress' ? 'rgba(37, 99, 235, 0.03)' : '#FFFFFF',
                      borderLeft: task.status === 'In Progress' ? '4px solid #2563EB' : '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                            Stop #{i + 1}: {task.customerName}
                          </span>
                          <span className={`badge ${
                            task.status === 'Completed' ? 'badge-primary' : 
                            task.status === 'In Progress' ? 'badge-warning' : 'badge-neutral'
                          }`}>
                            {task.status}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 700 }}>
                            <Clock size={13} style={{ display: 'inline', marginRight: '3px' }} /> {task.timeSlot}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                          <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} /> {task.address}
                        </div>

                        <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                          Items to collect: <strong>{task.items}</strong> • Est. Payout: <strong>₹{task.payoutEst}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {task.status !== 'Completed' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => showFeedback(`Opening GPS Navigation to ${task.address}...`)}
                              className="btn btn-outline btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <Navigation size={13} /> Navigate
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateTaskStatus(task.id, 'Completed')}
                              className="btn btn-primary btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <Check size={13} /> Weigh & Complete
                            </button>
                          </>
                        ) : (
                          <span className="badge badge-primary" style={{ padding: '0.4rem 0.75rem' }}>
                            ✓ Pickup Weighed & Settled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ROLE 3: PARTNER / SCRAP YARD MERCHANT PROFILE VIEW           */}
        {/* ============================================================ */}
        {activeRoleView === 'partner' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Partner Hero Identity Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <img
                    src={currentUser?.role === 'partner' ? (currentUser?.avatar || DEMO_USERS.partner.avatar) : DEMO_USERS.partner.avatar}
                    alt="Partner Avatar"
                    style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #D97706' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                        {currentUser?.role === 'partner' ? (currentUser?.businessName || DEMO_USERS.partner.businessName) : DEMO_USERS.partner.businessName}
                      </h2>
                      <span className="badge badge-warning" style={{ background: '#FEF3C7', color: '#92400E', fontWeight: 800 }}>
                        ★ {DEMO_USERS.partner.partnerTier}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                      <span>Proprietor: <strong>{currentUser?.role === 'partner' ? currentUser?.name : DEMO_USERS.partner.name}</strong></span>
                      <span>GSTIN: <strong>{currentUser?.gstin || DEMO_USERS.partner.gstin}</strong></span>
                      <span>Trade License: <strong>{DEMO_USERS.partner.tradeLicense}</strong></span>
                    </div>

                    <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                      <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      <strong>Yard Location:</strong> {currentUser?.address || DEMO_USERS.partner.address}, {currentUser?.city || DEMO_USERS.partner.city}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => showFeedback('Opening Wholesale Commodity Price Editor...')}
                    className="btn btn-outline btn-sm"
                  >
                    Edit Yard Buy Rates
                  </button>
                </div>
              </div>
            </div>

            {/* Commercial Yard Performance Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem'
            }}>
              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Monthly Capacity
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.15)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706' }}>
                  {DEMO_USERS.partner.monthlyCapacityTons} Tons
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                  Stock on hand: {yardStock} Tons (52% Full)
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Total Procurement
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scale size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {DEMO_USERS.partner.totalProcuredTons} Tons
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                  Processed for smelting & pulping
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Total Payouts Disbursed
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563EB' }}>
                  ₹{DEMO_USERS.partner.totalDisbursedLakhs} L
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                  Direct RTGS / UPI to sellers
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Active Fleet Vehicles
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(13, 92, 58, 0.12)', color: '#0D5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0D5C3A' }}>
                  {DEMO_USERS.partner.activeContractVehicles} Trucks
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                  100% Electric cargo vehicles
                </div>
              </div>
            </div>

            {/* Direct Mill Contracts & Accepted Scrap Types */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Card 1: Direct Mill Tieups */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                border: '1px solid var(--color-border)'
              }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0F172A' }}>
                  Direct Mill Offtake Contracts
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                  Certified processing plants linked to this merchant yard for bulk commodity liquidation.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {DEMO_USERS.partner.directMillTieups.map((mill, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'var(--color-bg)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B' }}>{mill}</span>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Active Contract</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Wholesale Banking Account */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                border: '1px solid var(--color-border)'
              }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0F172A' }}>
                  Wholesale Settlement Account
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                  Commercial RTGS account for bulk merchant procurement transactions.
                </p>

                <div style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: '#F8FAFC',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Bank Name</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', marginBottom: '0.5rem' }}>
                    {DEMO_USERS.partner.bankAccount.bankName}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Current Account</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A', marginBottom: '0.5rem' }}>
                    {DEMO_USERS.partner.bankAccount.accountNo} (IFSC: {DEMO_USERS.partner.bankAccount.ifsc})
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--color-accent-mint)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} /> Verified for B2B Direct Settlements
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ROLE 4: SUPER ADMIN PROFILE VIEW                             */}
        {/* ============================================================ */}
        {activeRoleView === 'admin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Admin Hero Identity Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <img
                    src={currentUser?.avatar || DEMO_USERS.admin.avatar}
                    alt="Admin Avatar"
                    style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #F59E0B' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                        {currentUser?.name || DEMO_USERS.admin.name}
                      </h2>
                      <span className="badge" style={{ background: '#FEF3C7', color: '#92400E', fontWeight: 800 }}>
                        <ShieldCheck size={13} style={{ display: 'inline', marginRight: '3px' }} /> Super Administrator
                      </span>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                        Tier-1 Root Security
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={14} /> {currentUser?.email || DEMO_USERS.admin.email}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={14} /> {currentUser?.phone || DEMO_USERS.admin.phone}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} /> {currentUser?.city || DEMO_USERS.admin.city} HQ
                      </span>
                    </div>

                    <div style={{ fontSize: '0.825rem', color: 'var(--color-text-secondary)' }}>
                      <strong>Privileges:</strong> Full CRUD on Live Rates, Order Dispatch, Partner Verification, and Financial Ledger
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {onOpenAdminPanel && (
                    <button
                      type="button"
                      onClick={onOpenAdminPanel}
                      className="btn btn-primary btn-sm"
                      style={{
                        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                        border: '1.5px solid #F59E0B',
                        color: '#FFFFFF',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem'
                      }}
                    >
                      <ShieldCheck size={15} color="#F59E0B" /> Launch Admin Control Room
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Platform Metrics Overview */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem'
            }}>
              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Active Pickups
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {orders.length > 0 ? orders.length : 3} Requests
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                  Real-time GPS monitored
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Verified Agents
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563EB' }}>
                  14 Executives
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                  100% Police Verified
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Partner Scrap Yards
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.15)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706' }}>
                  8 Facilities
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                  Direct Mill Offtake Linked
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Total Material Diverted
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(13, 92, 58, 0.12)', color: '#0D5C3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scale size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0D5C3A' }}>
                  420.5 Tons
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: '4px' }}>
                  Circular Economy Metric
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Multi-Role Privacy Reassurance & Guidance */}
        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
              <Lock size={15} color="var(--color-primary)" />
              <span>Multi-Role Identity Protection</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', margin: 0, maxWidth: '640px' }}>
              KabadCollect strictly maintains role-based access control. Field Collection Executives and Scrap Yard Merchant accounts require separate verified login credentials to prevent unauthorized exposure of customer and commercial records.
            </p>
          </div>

          {onOpenAuth && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
            >
              <KeyRound size={15} /> Sign In to Another Role
            </button>
          )}
        </div>
      </div>

      {/* 3. Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)} style={{ zIndex: 1200 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '520px', 
              width: '100%', 
              maxHeight: '90dvh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden'
            }}
          >
            <div className="modal-header" style={{ borderBottom: '1px solid var(--color-border)', flexShrink: 0, padding: '1.25rem 1.75rem', background: 'var(--color-surface)' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>Edit Customer Profile</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Update your contact details and default doorstep pickup address.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '1.5rem 1.75rem' }}>
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700 }}>Full Name</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700 }}>Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700 }}>Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* Default Pickup Address with GPS Current Location Button */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.45rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700, margin: 0 }}>
                    Default Pickup Address
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isDetectingLocation}
                    title="Detect GPS coordinates and auto-fill address, city, state & pincode"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#0D5C3A',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: isDetectingLocation ? 'wait' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.22)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)'; }}
                  >
                    {isDetectingLocation ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Locate size={13} color="#0D5C3A" />
                    )}
                    <span>{isDetectingLocation ? 'Detecting GPS...' : '📍 Use Current Location'}</span>
                  </button>
                </div>

                {locationSuccessMsg && (
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    marginBottom: '0.65rem',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    color: '#0D5C3A',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    <CheckCircle2 size={14} color="#10B981" />
                    <span>{locationSuccessMsg}</span>
                  </div>
                )}

                <textarea
                  rows={2}
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder="House / Flat No., Apartment, Street, Locality"
                  className="form-input"
                  required
                />
              </div>

              {/* Pincode with live Postal API Lookup */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700, margin: 0 }}>
                    Pincode <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(Auto-fills City & State)</span>
                  </label>
                  {isFetchingPincode && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Loader2 size={11} className="animate-spin" /> Looking up postal data...
                    </span>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    maxLength={6}
                    value={editFormData.pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="Enter 6-digit Pincode (e.g. 201014 or 380015)"
                    className="form-input"
                    style={{
                      paddingRight: '36px',
                      borderColor: pincodeStatus?.type === 'success' ? '#10B981' : pincodeStatus?.type === 'error' ? '#EF4444' : undefined
                    }}
                    required
                  />
                  <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                    {isFetchingPincode ? (
                      <Loader2 size={16} className="animate-spin" color="var(--color-primary)" />
                    ) : pincodeStatus?.type === 'success' ? (
                      <CheckCircle2 size={16} color="#10B981" />
                    ) : pincodeStatus?.type === 'error' ? (
                      <AlertCircle size={16} color="#EF4444" />
                    ) : (
                      <MapPin size={16} color="#94A3B8" />
                    )}
                  </div>
                </div>

                {/* Status pill & area suggestions */}
                {pincodeStatus && (
                  <div style={{
                    marginTop: '0.4rem',
                    padding: '0.35rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: pincodeStatus.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : pincodeStatus.type === 'error' ? 'rgba(239, 68, 68, 0.08)' : 'var(--color-bg-alt)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: pincodeStatus.type === 'success' ? '#0D5C3A' : pincodeStatus.type === 'error' ? '#DC2626' : 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    flexWrap: 'wrap'
                  }}>
                    <span>{pincodeStatus.message}</span>
                    {pincodeStatus.postOffices && pincodeStatus.postOffices.length > 1 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>Select Area:</span>
                        {pincodeStatus.postOffices.slice(0, 4).map((po) => (
                          <button
                            key={po}
                            type="button"
                            onClick={() => {
                              const currentAddr = editFormData.address || '';
                              if (!currentAddr.includes(po)) {
                                setEditFormData(prev => ({
                                  ...prev,
                                  address: currentAddr ? `${currentAddr}, ${po}` : po
                                }));
                              }
                            }}
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: '4px',
                              padding: '0.15rem 0.45rem',
                              fontSize: '0.68rem',
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            + {po}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* City & State (pre-filled from Pincode or GPS) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700 }}>
                    City / District
                  </label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    placeholder="e.g. Ghaziabad or Ahmedabad"
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700 }}>
                    State
                  </label>
                  <input
                    type="text"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    placeholder="e.g. Uttar Pradesh or Gujarat"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700 }}>
                  Primary UPI ID for Instant Payouts
                </label>
                <input
                  type="text"
                  value={editFormData.upiId}
                  onChange={(e) => setEditFormData({ ...editFormData, upiId: e.target.value })}
                  placeholder="e.g. mobile@upi or name@okaxis"
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}

      {/* Wallet Management & Impact Adjustment Modal */}
      {isWalletModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsWalletModalOpen(false)}
          style={{ zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '520px', 
              width: '100%', 
              background: '#FFFFFF', 
              borderRadius: 'var(--radius-xl)', 
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--color-border)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #072e1c 0%, #0D5C3A 65%, #10B981 100%)',
              color: '#FFFFFF',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}>
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                    Scrap Cash Wallet & Stats
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', opacity: 0.85, color: '#E2E8F0' }}>
                    Set your custom wallet cash balance & recycling impact
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsWalletModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveWalletData} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {walletSaveStatus && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#065F46',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>{walletSaveStatus}</span>
                </div>
              )}

              {/* Wallet Amount Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700, margin: 0 }}>
                    Wallet Balance / Total Cash Earned (₹)
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                    Current: ₹{displayWalletEarned.toLocaleString()}
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    color: '#059669'
                  }}>
                    ₹
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={walletAmountInput}
                    onChange={(e) => setWalletAmountInput(e.target.value)}
                    placeholder="e.g. 1500"
                    className="form-input"
                    style={{ paddingLeft: '32px', fontSize: '1.1rem', fontWeight: 700 }}
                    required
                  />
                </div>

                {/* Quick Presets */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Quick Add:</span>
                  {[
                    { label: '+₹250', val: 250 },
                    { label: '+₹500', val: 500 },
                    { label: '+₹1,000', val: 1000 },
                    { label: '+₹2,500', val: 2500 }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const cur = parseFloat(walletAmountInput) || 0;
                        setWalletAmountInput(String(cur + preset.val));
                      }}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        color: '#059669',
                        cursor: 'pointer'
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setWalletAmountInput('0')}
                    style={{
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-full)',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      color: '#64748B',
                      cursor: 'pointer'
                    }}
                  >
                    Reset ₹0
                  </button>
                </div>
              </div>

              {/* Scrap Recycled (kg) Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700, margin: 0 }}>
                    Total Scrap Recycled (kg)
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 700 }}>
                    Current: {displayTotalRecycled} kg
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={walletScrapKgInput}
                    onChange={(e) => setWalletScrapKgInput(e.target.value)}
                    placeholder="e.g. 45"
                    className="form-input"
                    style={{ fontWeight: 700 }}
                    required
                  />
                  <span style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--color-text-muted)'
                  }}>
                    kg
                  </span>
                </div>
              </div>

              {/* Real-time Computed Ecological Metrics Preview */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.45rem' }}>
                  Calculated Impact Preview
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Leaf size={12} /> CO₂ Avoided
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0D5C3A' }}>
                      {((parseFloat(walletScrapKgInput) || 0) * 1.85).toFixed(1)} kg
                    </div>
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={12} /> Trees Preserved
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#B45309' }}>
                      {((parseFloat(walletScrapKgInput) || 0) / 58).toFixed(1)} Trees
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1.25rem' }}
                >
                  <Save size={16} /> Save & Update Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
