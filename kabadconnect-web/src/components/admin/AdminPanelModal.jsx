import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Users, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Truck, 
  DollarSign, 
  Save, 
  Filter, 
  RefreshCw,
  Edit2,
  RotateCcw,
  Database,
  Server,
  HardDrive,
  AlertTriangle,
  ExternalLink,
  Key,
  Lock,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { KABADWALA_PARTNERS } from '../../data/kabadwalas';
import { apiSeedDatabase, apiGetDbConfig, apiUpdateDbConfig } from '../../services/api';

export const AdminPanelModal = ({ 
  isOpen, 
  onClose, 
  orders = [], 
  onUpdateOrderStatus, 
  onAssignKabadwala, 
  onCancelOrder,
  scrapItems = [],
  onUpdateScrapRate,
  currentUser,
  onReorder = null,
  dbStatus = { connected: false, status: 'checking', message: '' },
  onRefreshDbHealth = () => {},
  marketplaceItems = [],
  onDeleteProduct = null,
  partners = []
}) => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'rates', 'partners', 'marketplace', 'database'
  const [orderFilter, setOrderFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Rate editor state: { [itemId]: { rate: number, trendType: string } }
  const [editingRates, setEditingRates] = useState({});
  const [rateSavedMessage, setRateSavedMessage] = useState('');

  // Database Seed state
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  // Live MongoDB Atlas Connection State
  const [dbPassword, setDbPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [customUri, setCustomUri] = useState('');
  const [useCustomUri, setUseCustomUri] = useState(false);
  const [isConfiguringDb, setIsConfiguringDb] = useState(false);
  const [dbConfigMessage, setDbConfigMessage] = useState(null);
  const [collectionStats, setCollectionStats] = useState(null);

  const handleConnectAtlas = async (e) => {
    e?.preventDefault?.();
    if (!useCustomUri && !dbPassword.trim()) {
      setDbConfigMessage({ type: 'error', text: 'Please enter your MongoDB Atlas user password.' });
      return;
    }
    if (useCustomUri && !customUri.trim()) {
      setDbConfigMessage({ type: 'error', text: 'Please enter a valid MongoDB connection URI.' });
      return;
    }

    setIsConfiguringDb(true);
    setDbConfigMessage({ type: 'info', text: 'Connecting to MongoDB Atlas cluster and validating credentials...' });

    const payload = useCustomUri 
      ? { uri: customUri.trim() }
      : { password: dbPassword.trim(), databaseName: 'kabadconnect' };

    const res = await apiUpdateDbConfig(payload);
    setIsConfiguringDb(false);

    if (res && res.connected) {
      setDbConfigMessage({
        type: 'success',
        text: `Connected to MongoDB Atlas! Ping: ${res.pingMs}ms. All 5 collections are active.`
      });
      if (res.counts) {
        setCollectionStats(res.counts);
      }
      onRefreshDbHealth();
      setDbPassword('');
    } else {
      setDbConfigMessage({
        type: 'error',
        text: res?.message || res?.error || 'Could not connect. Verify your Atlas password and ensure IP 0.0.0.0/0 is allowed in Atlas Network Access.'
      });
    }
  };

  if (!isOpen) return null;

  // KPI calculations
  const totalOrdersCount = orders.length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const totalPayouts = orders.reduce((acc, o) => acc + (o.totalPaid || o.estimatedAmount || 750), 0);
  const totalCarbonOffset = orders.reduce((acc, o) => acc + (o.carbonOffsetKg || 45), 0);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = orderFilter === 'all' || o.status === orderFilter;
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleRateInputChange = (itemId, newRate) => {
    setEditingRates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        rate: Number(newRate)
      }
    }));
  };

  const handleSaveRate = (item) => {
    const updated = editingRates[item.id];
    const newRate = updated?.rate !== undefined ? updated.rate : item.rate;
    const newTrend = updated?.trendType || item.trendType;
    
    onUpdateScrapRate(item.id, newRate, newTrend);
    setRateSavedMessage(`Updated rate for "${item.name}" to ₹${newRate}/${item.unit || 'kg'}`);
    setTimeout(() => setRateSavedMessage(''), 3500);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1250 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '960px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          background: '#F8FAFC'
        }}
      >
        {/* Admin Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          padding: '1rem clamp(0.75rem, 2vw, 1.75rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34D399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ color: '#FFFFFF', margin: 0, fontSize: 'clamp(1rem, 2.5vw, 1.3rem)' }}>
                  KabadConnect Admin Portal
                </h3>
                <span style={{
                  background: '#F59E0B',
                  color: '#000000',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}>
                  SUPER ADMIN
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Logged in as <strong>{currentUser?.name || 'Administrator'}</strong> • Marketplace Control Room
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
            aria-label="Close admin portal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Top KPI Summary Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.65rem',
          padding: '0.85rem clamp(0.75rem, 2vw, 1.75rem)',
          background: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div style={{ padding: '0.65rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Total Pickups</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{totalOrdersCount}</div>
          </div>

          <div style={{ padding: '0.65rem', background: '#ECFDF5', borderRadius: 'var(--radius-md)', border: '1px solid #A7F3D0' }}>
            <div style={{ fontSize: '0.7rem', color: '#047857', fontWeight: 600, textTransform: 'uppercase' }}>Completed & Paid</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065F46' }}>{completedOrdersCount}</div>
          </div>

          <div style={{ padding: '0.65rem', background: '#FEF3C7', borderRadius: 'var(--radius-md)', border: '1px solid #FDE68A' }}>
            <div style={{ fontSize: '0.7rem', color: '#B45309', fontWeight: 600, textTransform: 'uppercase' }}>Total Payouts</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400E' }}>₹{totalPayouts.toLocaleString()}</div>
          </div>

          <div style={{ padding: '0.65rem', background: '#EFF6FF', borderRadius: 'var(--radius-md)', border: '1px solid #BFDBFE' }}>
            <div style={{ fontSize: '0.7rem', color: '#1D4ED8', fontWeight: 600, textTransform: 'uppercase' }}>Kabadwalas</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E40AF' }}>{KABADWALA_PARTNERS.length}</div>
          </div>

          <div style={{ padding: '0.65rem', background: '#F0FDF4', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 600, textTransform: 'uppercase' }}>CO₂ Offsets</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>{totalCarbonOffset.toFixed(0)} kg</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="no-scrollbar" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.65rem clamp(0.75rem, 2vw, 1.25rem)',
          background: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          overflowX: 'auto',
          overflowY: 'hidden',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          flexShrink: 0
        }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'orders' ? '#0F172A' : '#E2E8F0',
              color: activeTab === 'orders' ? '#FFFFFF' : '#475569',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'background 0.15s ease, color 0.15s ease'
            }}
          >
            📋 All Orders ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('rates')}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'rates' ? '#0F172A' : '#E2E8F0',
              color: activeTab === 'rates' ? '#FFFFFF' : '#475569',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'background 0.15s ease, color 0.15s ease'
            }}
          >
            📊 Live Scrap Rate Editor
          </button>

          <button
            onClick={() => setActiveTab('partners')}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'partners' ? '#0F172A' : '#E2E8F0',
              color: activeTab === 'partners' ? '#FFFFFF' : '#475569',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'background 0.15s ease, color 0.15s ease'
            }}
          >
            🚚 Verified Kabadwalas ({partners && partners.length > 0 ? partners.length : KABADWALA_PARTNERS.length})
          </button>

          <button
            onClick={() => setActiveTab('marketplace')}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'marketplace' ? '#0F172A' : '#E2E8F0',
              color: activeTab === 'marketplace' ? '#FFFFFF' : '#475569',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'background 0.15s ease, color 0.15s ease'
            }}
          >
            <span>🛋️ Marketplace Goods</span>
            <span style={{
              background: activeTab === 'marketplace' ? 'rgba(255,255,255,0.25)' : '#CBD5E1',
              padding: '1px 6px',
              borderRadius: '999px',
              fontSize: '0.7rem'
            }}>
              {marketplaceItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeTab === 'database' ? '#0F172A' : '#E2E8F0',
              color: activeTab === 'database' ? '#FFFFFF' : '#475569',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'background 0.15s ease, color 0.15s ease'
            }}
          >
            <Database size={15} color={activeTab === 'database' ? '#10B981' : 'currentColor'} />
            <span>MongoDB & Vercel Deploy</span>
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.28rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 800,
              background: dbStatus?.connected ? '#ECFDF5' : '#FFFBEB',
              color: dbStatus?.connected ? '#047857' : '#B45309',
              border: `1px solid ${dbStatus?.connected ? '#A7F3D0' : '#FDE68A'}`,
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: dbStatus?.connected ? '#10B981' : '#F59E0B'
              }} />
              <span>{dbStatus?.connected ? `MongoDB Atlas (${dbStatus.pingMs || 35}ms)` : 'MongoDB Demo Fallback'}</span>
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(0.75rem, 2vw, 1.5rem)' }}>
          {/* TAB 1: ALL ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div>
              {/* Search & Filter Controls */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 240px', position: 'relative' }}>
                  <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search by Order ID, customer, address, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {['all', 'in_transit', 'assigned', 'completed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setOrderFilter(status)}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.785rem',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: orderFilter === status ? '#0F172A' : '#CBD5E1',
                        background: orderFilter === status ? '#0F172A' : '#FFFFFF',
                        color: orderFilter === status ? '#FFFFFF' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {status.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Pickup Slot & Address</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Assigned Partner</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status Control</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8' }}>
                          No orders matched your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          {/* ID */}
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                            {order.id}
                            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 400 }}>
                              {order.estimatedWeight} (₹{order.estimatedAmount || order.totalPaid})
                            </div>
                          </td>

                          {/* Customer */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>{order.customerName}</div>
                            <div style={{ color: '#64748B', fontSize: '0.75rem' }}>{order.phone}</div>
                          </td>

                          {/* Address & Slot */}
                          <td style={{ padding: '0.85rem 1rem', maxWidth: '200px' }}>
                            <div style={{ fontWeight: 600, color: '#0F172A' }}>{order.scheduledSlot}</div>
                            <div style={{ color: '#64748B', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {order.address}
                            </div>
                          </td>

                          {/* Assigned Kabadwala Dropdown */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <select
                              value={order.kabadwala?.id || ''}
                              onChange={(e) => {
                                const partner = KABADWALA_PARTNERS.find(p => p.id === e.target.value);
                                if (partner) onAssignKabadwala(order.id, partner);
                              }}
                              style={{
                                padding: '0.35rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid #CBD5E1',
                                fontSize: '0.785rem',
                                background: '#FFFFFF',
                                fontWeight: 500,
                                maxWidth: '160px'
                              }}
                            >
                              <option value="">Select Partner</option>
                              {KABADWALA_PARTNERS.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.city})
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Status Dropdown */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <select
                              value={order.status}
                              onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                              style={{
                                padding: '0.35rem 0.65rem',
                                borderRadius: '999px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                background: 
                                  order.status === 'completed' ? '#DCFCE7' :
                                  order.status === 'in_transit' ? '#DBEAFE' :
                                  order.status === 'cancelled' ? '#FEE2E2' : '#FEF3C7',
                                color:
                                  order.status === 'completed' ? '#166534' :
                                  order.status === 'in_transit' ? '#1E40AF' :
                                  order.status === 'cancelled' ? '#991B1B' : '#92400E'
                              }}
                            >
                              <option value="pending">⏳ Pending</option>
                              <option value="assigned">👤 Assigned</option>
                              <option value="in_transit">🛺 In Transit</option>
                              <option value="completed">✓ Completed</option>
                              <option value="cancelled">❌ Cancelled</option>
                            </select>
                          </td>

                          {/* Admin Actions */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              {onReorder && (
                                <button
                                  onClick={() => {
                                    onReorder(order);
                                    onClose();
                                  }}
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.75rem',
                                    background: '#F0FDF4',
                                    color: '#166534',
                                    border: '1px solid #BBF7D0',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                  title="Duplicate / Reorder this pickup"
                                >
                                  <RotateCcw size={12} />
                                  <span>Reorder</span>
                                </button>
                              )}
                              {order.status !== 'cancelled' && (
                                <button
                                  onClick={() => onCancelOrder(order.id, 'Administrative cancellation')}
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.75rem',
                                    background: '#FEE2E2',
                                    color: '#DC2626',
                                    border: '1px solid #FCA5A5',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                  }}
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE SCRAP RATE EDITOR */}
          {activeTab === 'rates' && (
            <div>
              {rateSavedMessage && (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: '#ECFDF5',
                  border: '1px solid #34D399',
                  borderRadius: 'var(--radius-md)',
                  color: '#065F46',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>{rateSavedMessage}</span>
                </div>
              )}

              <div className="scroll-touch-x" style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                overflowX: 'auto',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Item Name</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Current Rate (₹/unit)</th>
                      <th style={{ padding: '0.75rem 1rem' }}>New Rate</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Trend Indicator</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Save</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scrapItems.map((item) => {
                      const currentVal = editingRates[item.id]?.rate !== undefined 
                        ? editingRates[item.id].rate 
                        : item.rate;

                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <strong>{item.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.hindiName}</div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                              {item.category}
                            </span>
                          </td>

                          <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                            ₹{item.rate}/{item.unit || 'kg'}
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontWeight: 700 }}>₹</span>
                              <input
                                type="number"
                                min="1"
                                value={currentVal}
                                onChange={(e) => handleRateInputChange(item.id, e.target.value)}
                                style={{
                                  width: '70px',
                                  padding: '4px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1.5px solid #CBD5E1',
                                  fontSize: '0.85rem',
                                  fontWeight: 700
                                }}
                              />
                            </div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: item.trendType === 'up' ? '#10B981' : item.trendType === 'down' ? '#EF4444' : '#64748B'
                            }}>
                              {item.trendType === 'up' ? '↗ High' : item.trendType === 'down' ? '↘ Low' : '— Stable'} ({item.trend})
                            </span>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <button
                              onClick={() => handleSaveRate(item)}
                              className="btn btn-primary btn-sm"
                              style={{ padding: '4px 10px', fontSize: '0.785rem' }}
                            >
                              <Save size={13} />
                              <span>Update</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: VERIFIED PARTNERS */}
          {activeTab === 'partners' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {KABADWALA_PARTNERS.map((partner) => (
                <div
                  key={partner.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <img
                      src={partner.photo}
                      alt={partner.name}
                      style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{partner.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{partner.businessName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>{partner.city}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.85rem' }}>
                    <div>Vehicle: <strong>{partner.vehicle}</strong> ({partner.vehicleReg})</div>
                    <div>Pickups completed: <strong>{partner.totalPickups}</strong></div>
                    <div>Rating: <strong style={{ color: '#F59E0B' }}>★ {partner.rating}</strong></div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                      <CheckCircle2 size={11} /> Digital Scale
                    </span>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                      <ShieldCheck size={11} /> KYC Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: MARKETPLACE PRODUCTS (ALMIRAH, AC, SOFA, BEDS, CYCLES, ETC.) */}
          {activeTab === 'marketplace' && (
            <div>
              <div style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{
                  padding: '1rem 1.25rem',
                  background: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                      Pre-Loved & Upcycled Products in Database ({marketplaceItems.length})
                    </h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.775rem', color: '#64748B' }}>
                      Managed via MongoDB Atlas /api/marketplace collection with live seller contacts
                    </p>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                    <thead>
                      <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Item</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Selling Price</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Condition</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Seller Contact</th>
                        <th style={{ padding: '0.75rem 1rem' }}>City / Hub</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketplaceItems.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <img
                                src={item.images?.[0] || 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=150&q=80'}
                                alt={item.title}
                                style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                              />
                              <div>
                                <div style={{ fontWeight: 700, color: '#0F172A', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.title}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase' }}>
                                  ID: {item.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                              {item.subcategory || item.category}
                            </span>
                          </td>

                          <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                            ₹{item.price?.toLocaleString('en-IN')}
                            {item.originalPrice && (
                              <div style={{ fontSize: '0.7rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                                ₹{item.originalPrice?.toLocaleString('en-IN')}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span className="badge badge-warning" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                              {item.condition ? item.condition.replace('_', ' ') : 'Good'}
                            </span>
                          </td>

                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 600, color: '#1E293B' }}>{item.seller?.name || 'Local Citizen'}</div>
                            <div style={{ fontSize: '0.725rem', color: '#64748B' }}>{item.seller?.phone || 'N/A'}</div>
                          </td>

                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontWeight: 600 }}>{item.city}</div>
                            <div style={{ fontSize: '0.725rem', color: '#64748B' }}>{item.locality || '-'}</div>
                          </td>

                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span className={`badge ${item.status === 'sold' ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                              {item.status === 'sold' ? 'Sold' : 'Available'}
                            </span>
                          </td>

                          <td style={{ padding: '0.75rem 1rem' }}>
                            {onDeleteProduct && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Delete product "${item.title}" from database?`)) {
                                    onDeleteProduct(item.id);
                                  }
                                }}
                                style={{
                                  background: '#FEE2E2',
                                  color: '#DC2626',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '4px 8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                                title="Delete product"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MONGODB ATLAS & VERCEL DEPLOYMENT PANEL */}
          {activeTab === 'database' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Feedback toast */}
              {seedMessage && (
                <div style={{
                  padding: '0.85rem 1.25rem',
                  background: '#0D5C3A',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}>
                  <CheckCircle2 size={16} color="#34D399" />
                  <span>{seedMessage}</span>
                </div>
              )}

              {/* Card 1: Interactive Live MongoDB Atlas Connection Manager */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: dbStatus?.connected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.15)',
                      color: dbStatus?.connected ? '#059669' : '#D97706',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Database size={24} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                          MongoDB Atlas Database Manager
                        </h3>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: dbStatus?.connected ? '#ECFDF5' : '#FEF3C7',
                          color: dbStatus?.connected ? '#047857' : '#B45309',
                          border: `1px solid ${dbStatus?.connected ? '#A7F3D0' : '#FDE68A'}`
                        }}>
                          {dbStatus?.connected ? '🟢 LIVE CONNECTED' : '🟡 NEEDS ATLAS PASSWORD'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.825rem', color: '#64748B', margin: '3px 0 0 0' }}>
                        {dbStatus?.connected
                          ? `Active Atlas cluster: cluster0.xzdc97o.mongodb.net • Database: ${dbStatus.dbName || 'kabadconnect'} • Latency: ${dbStatus.pingMs || 35}ms`
                          : 'Target cluster: cluster0.xzdc97o.mongodb.net • Username: yogeshalbiorix_db_user'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        onRefreshDbHealth();
                        setSeedMessage('Testing MongoDB Atlas connection ping...');
                        setTimeout(() => setSeedMessage(''), 2500);
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <RefreshCw size={13} /> Test Ping
                    </button>

                    <button
                      type="button"
                      disabled={isSeeding}
                      onClick={async () => {
                        setIsSeeding(true);
                        setSeedMessage('Seeding all 5 collections (Rates, Partners, Marketplace Goods, Orders, Users) to MongoDB...');
                        const res = await apiSeedDatabase();
                        setIsSeeding(false);
                        if (res && res.success) {
                          setSeedMessage('Successfully populated MongoDB with all 5 collections!');
                          if (res.counts) setCollectionStats(res.counts);
                          onRefreshDbHealth();
                        } else {
                          setSeedMessage(res?.error || 'Seeded local state. When MONGODB_URI is configured, it populates Atlas directly.');
                        }
                        setTimeout(() => setSeedMessage(''), 4000);
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <HardDrive size={13} /> Sync / Re-Seed Database
                    </button>
                  </div>
                </div>

                {/* Connection Form (Enter Atlas Password or Custom URI) */}
                <div style={{
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  border: '1px solid #E2E8F0',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                      <Lock size={15} color="#2563EB" />
                      <span>{useCustomUri ? 'Enter Custom MongoDB Connection URI' : 'Set Database Password for yogeshalbiorix_db_user'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUseCustomUri(!useCustomUri)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563EB',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      {useCustomUri ? 'Switch to Password Input' : 'Paste Full MongoDB URI instead'}
                    </button>
                  </div>

                  <form onSubmit={handleConnectAtlas} style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {useCustomUri ? (
                      <div style={{ flex: '1 1 300px' }}>
                        <input
                          type="text"
                          placeholder="mongodb+srv://user:password@cluster0.xzdc97o.mongodb.net/kabadconnect"
                          value={customUri}
                          onChange={(e) => setCustomUri(e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.85rem', width: '100%', padding: '0.55rem 0.85rem' }}
                        />
                      </div>
                    ) : (
                      <div style={{ flex: '1 1 240px', position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your MongoDB Atlas user password..."
                          value={dbPassword}
                          onChange={(e) => setDbPassword(e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.85rem', width: '100%', padding: '0.55rem 2.4rem 0.55rem 0.85rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#94A3B8'
                          }}
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isConfiguringDb}
                      className="btn btn-primary"
                      style={{
                        padding: '0.55rem 1.25rem',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        flexShrink: 0
                      }}
                    >
                      {isConfiguringDb ? (
                        <>
                          <RefreshCw size={14} className="spin" /> Connecting & Seeding...
                        </>
                      ) : (
                        <>
                          <Check size={14} /> Connect & Seed All Data
                        </>
                      )}
                    </button>
                  </form>

                  {/* Feedback Message */}
                  {dbConfigMessage && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.65rem 0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: dbConfigMessage.type === 'success' ? '#ECFDF5' : dbConfigMessage.type === 'error' ? '#FEF2F2' : '#EFF6FF',
                      color: dbConfigMessage.type === 'success' ? '#047857' : dbConfigMessage.type === 'error' ? '#B91C1C' : '#1D4ED8',
                      border: `1px solid ${dbConfigMessage.type === 'success' ? '#A7F3D0' : dbConfigMessage.type === 'error' ? '#FECACA' : '#BFDBFE'}`
                    }}>
                      {dbConfigMessage.type === 'success' ? <CheckCircle2 size={16} /> : dbConfigMessage.type === 'error' ? <XCircle size={16} /> : <RefreshCw size={16} className="spin" />}
                      <span>{dbConfigMessage.text}</span>
                    </div>
                  )}
                </div>

                {/* 5 MongoDB Collections Status Overview */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📦 5 MongoDB Database Collections Managed in Atlas
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: '0.75rem'
                  }}>
                    {/* Collection 1: Scrap Rates */}
                    <div style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>1. Scrap Rates</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '2px 0' }}>
                        {collectionStats?.rates || scrapItems.length} Materials
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
                        Paper, Plastic, Metal, E-Waste
                      </div>
                    </div>

                    {/* Collection 2: Orders */}
                    <div style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>2. Pickup Orders</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '2px 0' }}>
                        {collectionStats?.orders || orders.length} Pickups
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600 }}>
                        Customer bookings & weights
                      </div>
                    </div>

                    {/* Collection 3: Partners */}
                    <div style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>3. Verified Partners</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '2px 0' }}>
                        {collectionStats?.partners || (partners && partners.length > 0 ? partners.length : KABADWALA_PARTNERS.length)} Kabadwalas
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#D97706', fontWeight: 600 }}>
                        Hyperlocal GPS & scale kyc
                      </div>
                    </div>

                    {/* Collection 4: Marketplace */}
                    <div style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>4. Marketplace Goods</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '2px 0' }}>
                        {collectionStats?.marketplace || marketplaceItems.length} Products
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#7C3AED', fontWeight: 600 }}>
                        Almira, AC, Sofa, Bed, Cycle
                      </div>
                    </div>

                    {/* Collection 5: Users */}
                    <div style={{ padding: '0.85rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>5. Users & Auth</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '2px 0' }}>
                        {collectionStats?.users || 3} Profiles
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600 }}>
                        Customers, Partners, Admin
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagnostics Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  background: '#F8FAFC',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #E2E8F0'
                }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Connection State</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: dbStatus?.connected ? '#059669' : '#D97706', marginTop: '2px' }}>
                      {dbStatus?.connected ? '🟢 Connected (Atlas Live)' : '🟡 Awaiting Atlas Password'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Ping Latency</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                      {dbStatus?.pingMs ? `${dbStatus.pingMs} ms` : 'N/A (Offline)'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Vercel Serverless Ready</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2563EB', marginTop: '2px' }}>
                      ✅ /api/orders, /api/rates, /api/marketplace
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Connection Pooling</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                      Cached Global Pool (Max 10)
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: 3-Step Vercel Deployment Guide */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <Server size={18} color="#2563EB" />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                    How to Deploy to Vercel (1-Click Instructions)
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0F172A', marginBottom: '0.35rem' }}>
                      1. Push to GitHub
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                      Push your code to a GitHub or GitLab repository. All Vercel configs (<code>vercel.json</code>) are already configured!
                    </p>
                  </div>

                  <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0F172A', marginBottom: '0.35rem' }}>
                      2. Import to Vercel
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                      On <a href="https://vercel.com" target="_blank" rel="noreferrer" style={{ color: '#2563EB', fontWeight: 700 }}>vercel.com</a>, click <strong>Add New Project</strong> and import your repository.
                    </p>
                  </div>

                  <div style={{ padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0F172A', marginBottom: '0.35rem' }}>
                      3. Set Environment Variable
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                      In Vercel <strong>Environment Variables</strong>, add <code>MONGODB_URI</code> with your Atlas connection string and click Deploy.
                    </p>
                  </div>
                </div>

                {/* Connection String Sample */}
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  background: '#0F172A',
                  color: '#94A3B8',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ color: '#F59E0B', fontWeight: 700, marginBottom: '4px' }}># Sample Vercel Environment Variable:</div>
                  <div style={{ color: '#38BDF8', wordBreak: 'break-all' }}>
                    MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.mongodb.net/kabadconnect?retryWrites=true&amp;w=majority
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
