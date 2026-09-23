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
  Check,
  Plus,
  Trash2,
  Sparkles,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Settings2,
  Tag,
  Sliders,
  PlusCircle,
  HelpCircle,
  Info
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
  onCreateScrapItem = null,
  onDeleteScrapItem = null,
  onBulkUpdateScrapRates = null,
  onResetScrapRates = null,
  currentUser,
  onReorder = null,
  dbStatus = { connected: false, status: 'checking', message: '' },
  onRefreshDbHealth = () => { },
  marketplaceItems = [],
  onDeleteProduct = null,
  partners = [],
  onOpenDoorstepVerification = null
}) => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'rates', 'partners', 'marketplace', 'database'
  const [orderFilter, setOrderFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Rate editor state: { [itemId]: { rate: number, trendType: string, trend: string } }
  const [editingRates, setEditingRates] = useState({});
  const [rateSavedMessage, setRateSavedMessage] = useState('');

  // Scrap Manager State
  const [scrapCategoryFilter, setScrapCategoryFilter] = useState('all');
  const [scrapSearchQuery, setScrapSearchQuery] = useState('');
  const [isAddScrapModalOpen, setIsAddScrapModalOpen] = useState(false);
  const [isBulkAdjustModalOpen, setIsBulkAdjustModalOpen] = useState(false);
  const [editingScrapItem, setEditingScrapItem] = useState(null);
  const [deleteConfirmScrapId, setDeleteConfirmScrapId] = useState(null);

  // New Scrap Item Form State
  const initialNewScrapForm = {
    name: '',
    hindiName: '',
    category: 'paper',
    rate: '',
    unit: 'kg',
    trend: 'Stable',
    trendType: 'stable',
    minWeight: '5 kg',
    description: '',
    co2SavedPerKg: 1.5,
    waterSavedPerKg: 20,
    treesSavedPerKg: 0.015
  };
  const [newScrapForm, setNewScrapForm] = useState(initialNewScrapForm);

  // Bulk Adjustment Form State
  const [bulkCategory, setBulkCategory] = useState('metal');
  const [bulkAdjustmentType, setBulkAdjustmentType] = useState('percent'); // 'percent' | 'amount'
  const [bulkAdjustmentSign, setBulkAdjustmentSign] = useState('+'); // '+' | '-'
  const [bulkAdjustmentValue, setBulkAdjustmentValue] = useState(5);

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
      : { password: dbPassword.trim(), databaseName: 'kabadcollect' };

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

  // Scrap Rate Filtering
  const filteredScrapItems = scrapItems.filter((item) => {
    const matchesCategory = scrapCategoryFilter === 'all' || item.category === scrapCategoryFilter;
    const matchesSearch =
      !scrapSearchQuery.trim() ||
      item.name.toLowerCase().includes(scrapSearchQuery.toLowerCase()) ||
      (item.hindiName && item.hindiName.toLowerCase().includes(scrapSearchQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(scrapSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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

  const handleTrendTypeChange = (itemId, trendType) => {
    setEditingRates(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        trendType,
        trend: trendType === 'up' ? '+₹2.00 today' : trendType === 'down' ? '-₹1.00 today' : 'Stable'
      }
    }));
  };

  const handleSaveRate = (item) => {
    const updated = editingRates[item.id];
    const newRate = updated?.rate !== undefined ? updated.rate : item.rate;
    const newTrendType = updated?.trendType || item.trendType;
    const newTrend = updated?.trend || (newTrendType === 'up' ? '+₹2.00 today' : newTrendType === 'down' ? '-₹1.00 today' : 'Stable');

    onUpdateScrapRate(item.id, {
      rate: newRate,
      trend: newTrend,
      trendType: newTrendType
    });
    setRateSavedMessage(`✓ Updated "${item.name}" rate to ₹${newRate}/${item.unit || 'kg'} (${newTrendType})`);
    setTimeout(() => setRateSavedMessage(''), 3500);
  };

  const handleCreateNewScrapSubmit = async (e) => {
    e.preventDefault();
    if (!newScrapForm.name.trim() || !newScrapForm.rate) {
      alert('Please fill in Item Name and Rate.');
      return;
    }

    const payload = {
      ...newScrapForm,
      rate: Number(newScrapForm.rate),
      co2SavedPerKg: Number(newScrapForm.co2SavedPerKg) || 1.5,
      waterSavedPerKg: Number(newScrapForm.waterSavedPerKg) || 20,
      treesSavedPerKg: Number(newScrapForm.treesSavedPerKg) || 0.015,
      trend: newScrapForm.trend || 'Stable',
      trendType: newScrapForm.trendType || 'stable'
    };

    if (onCreateScrapItem) {
      await onCreateScrapItem(payload);
    }
    setIsAddScrapModalOpen(false);
    setNewScrapForm(initialNewScrapForm);
    setRateSavedMessage(`✓ Added new scrap item "${payload.name}" to live catalog.`);
    setTimeout(() => setRateSavedMessage(''), 3500);
  };

  const handleSaveEditScrapSubmit = (e) => {
    e.preventDefault();
    if (!editingScrapItem) return;

    onUpdateScrapRate(editingScrapItem.id, {
      ...editingScrapItem,
      rate: Number(editingScrapItem.rate),
      co2SavedPerKg: Number(editingScrapItem.co2SavedPerKg) || 1.5,
      waterSavedPerKg: Number(editingScrapItem.waterSavedPerKg) || 20,
      treesSavedPerKg: Number(editingScrapItem.treesSavedPerKg) || 0.015
    });

    setRateSavedMessage(`✓ Updated full details for "${editingScrapItem.name}".`);
    setEditingScrapItem(null);
    setTimeout(() => setRateSavedMessage(''), 3500);
  };

  const handleExecuteBulkAdjust = async (e) => {
    e.preventDefault();
    const val = Number(bulkAdjustmentValue);
    if (!val || val <= 0) {
      alert('Please enter a valid adjustment value.');
      return;
    }

    const sign = bulkAdjustmentSign === '+' ? 1 : -1;
    const finalVal = val * sign;

    if (onBulkUpdateScrapRates) {
      if (bulkAdjustmentType === 'percent') {
        await onBulkUpdateScrapRates(bulkCategory, finalVal, null);
      } else {
        await onBulkUpdateScrapRates(bulkCategory, null, finalVal);
      }
    }

    setIsBulkAdjustModalOpen(false);
    setRateSavedMessage(`✓ Applied ${bulkAdjustmentSign}${val}${bulkAdjustmentType === 'percent' ? '%' : ' ₹'} adjustment across ${bulkCategory.toUpperCase()} items.`);
    setTimeout(() => setRateSavedMessage(''), 4000);
  };

  const handleDeleteScrapConfirmed = async (itemId) => {
    if (onDeleteScrapItem) {
      await onDeleteScrapItem(itemId);
    }
    setDeleteConfirmScrapId(null);
    setRateSavedMessage('✓ Item deleted from scrap catalog.');
    setTimeout(() => setRateSavedMessage(''), 3500);
  };

  const handleResetRatesConfirmed = async () => {
    if (window.confirm('Reset all scrap rates to the standard baseline catalog? Any custom prices will revert.')) {
      if (onResetScrapRates) {
        await onResetScrapRates();
      }
      setRateSavedMessage('✓ Reset all scrap items to official master baseline catalog.');
      setTimeout(() => setRateSavedMessage(''), 4000);
    }
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
                  KabadCollect Admin Portal
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
                              {onOpenDoorstepVerification && order.status !== 'cancelled' && (
                                <button
                                  onClick={() => {
                                    onOpenDoorstepVerification(order);
                                    onClose();
                                  }}
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.75rem',
                                    background: '#ECFDF5',
                                    color: '#065F46',
                                    border: '1px solid #A7F3D0',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                  title="Inspect items, verify OTP and pay"
                                >
                                  <Scale size={12} />
                                  <span>Doorstep Pay</span>
                                </button>
                              )}
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

          {/* TAB 2: COMPREHENSIVE SCRAP RATES & CATALOG MANAGER */}
          {activeTab === 'rates' && (
            <div>
              {/* Notification Banner */}
              {rateSavedMessage && (
                <div style={{
                  padding: '0.75rem 1.25rem',
                  background: '#ECFDF5',
                  border: '1px solid #34D399',
                  borderRadius: 'var(--radius-md)',
                  color: '#065F46',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  boxShadow: 'var(--shadow-xs)'
                }}>
                  <CheckCircle2 size={18} color="#10B981" />
                  <span>{rateSavedMessage}</span>
                </div>
              )}

              {/* Manager Toolbar */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem 1.25rem',
                border: '1px solid var(--color-border)',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Scale size={18} color="var(--color-primary)" />
                      <span>Live Scrap Pricing & Catalog Engine</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: '999px' }}>
                        {scrapItems.length} Managed Items
                      </span>
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.785rem', color: '#64748B' }}>
                      Set doorstep benchmark rates, daily market fluctuations, unit types, and min pickup rules across all consumer and agent touchpoints.
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setIsAddScrapModalOpen(true)}
                      className="btn btn-primary btn-sm"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Plus size={15} />
                      <span>Add Scrap Item</span>
                    </button>

                    <button
                      onClick={() => setIsBulkAdjustModalOpen(true)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: '#EEF2FF',
                        color: '#4338CA',
                        borderColor: '#C7D2FE',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                      title="Adjust entire category margins by % or ₹"
                    >
                      <Sliders size={14} />
                      <span>Bulk Adjust Margins</span>
                    </button>

                    <button
                      onClick={handleResetRatesConfirmed}
                      className="btn btn-secondary btn-sm"
                      style={{
                        padding: '6px 10px',
                        fontSize: '0.785rem',
                        color: '#64748B',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Reset all prices to standard baseline"
                    >
                      <RotateCcw size={13} />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>

                {/* Search & Category Filter */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid #F1F5F9'
                }}>
                  {/* Category Pills */}
                  <div className="no-scrollbar" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    overflowX: 'auto',
                    maxWidth: '100%'
                  }}>
                    {[
                      { id: 'all', label: 'All Items' },
                      { id: 'paper', label: '📄 Paper' },
                      { id: 'plastic', label: '🧴 Plastics' },
                      { id: 'metal', label: '🔩 Metals' },
                      { id: 'ewaste', label: '💻 E-Waste' },
                      { id: 'battery', label: '🔋 Batteries' }
                    ].map(cat => {
                      const isActive = scrapCategoryFilter === cat.id;
                      const count = cat.id === 'all'
                        ? scrapItems.length
                        : scrapItems.filter(i => i.category === cat.id).length;

                      return (
                        <button
                          key={cat.id}
                          onClick={() => setScrapCategoryFilter(cat.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: isActive ? 700 : 500,
                            background: isActive ? 'var(--color-primary)' : '#F8FAFC',
                            color: isActive ? '#FFFFFF' : '#475569',
                            border: `1px solid ${isActive ? 'var(--color-primary)' : '#E2E8F0'}`,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{cat.label}</span>
                          <span style={{
                            fontSize: '0.65rem',
                            background: isActive ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                            padding: '1px 5px',
                            borderRadius: '999px'
                          }}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Bar */}
                  <div style={{ position: 'relative', minWidth: '220px', flex: '1', maxWidth: '300px' }}>
                    <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Search scrap / कबाड़..."
                      value={scrapSearchQuery}
                      onChange={(e) => setScrapSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 10px 5px 30px',
                        fontSize: '0.8rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #CBD5E1',
                        background: '#F8FAFC'
                      }}
                    />
                    {scrapSearchQuery && (
                      <button
                        onClick={() => setScrapSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          border: 'none',
                          background: 'transparent',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Scrap Items Catalog Table */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                overflowX: 'auto',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left', color: '#475569' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Scrap Item & Hindi Name</th>
                      <th style={{ padding: '0.75rem 0.75rem' }}>Category</th>
                      <th style={{ padding: '0.75rem 0.75rem' }}>Unit</th>
                      <th style={{ padding: '0.75rem 0.75rem' }}>Current Rate</th>
                      <th style={{ padding: '0.75rem 0.75rem', minWidth: '120px' }}>New Rate</th>
                      <th style={{ padding: '0.75rem 0.75rem', minWidth: '160px' }}>Market Trend</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredScrapItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748B' }}>
                          <Package size={36} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
                          <div style={{ fontWeight: 600 }}>No scrap items found matching criteria.</div>
                          <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Try adjusting your category filter or search query.</div>
                        </td>
                      </tr>
                    ) : (
                      filteredScrapItems.map((item) => {
                        const currentVal = editingRates[item.id]?.rate !== undefined
                          ? editingRates[item.id].rate
                          : item.rate;

                        const currentTrendType = editingRates[item.id]?.trendType !== undefined
                          ? editingRates[item.id].trendType
                          : (item.trendType || 'stable');

                        const isChanged = (editingRates[item.id]?.rate !== undefined && editingRates[item.id].rate !== item.rate) ||
                          (editingRates[item.id]?.trendType !== undefined && editingRates[item.id].trendType !== item.trendType);

                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0', background: isChanged ? '#F0FDF4' : 'transparent', transition: 'background 0.2s ease' }}>
                            {/* Name & Hindi */}
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{item.name}</span>
                                {item.minWeight && (
                                  <span style={{ fontSize: '0.685rem', background: '#F1F5F9', color: '#64748B', padding: '1px 6px', borderRadius: '4px', fontWeight: 500 }}>
                                    Min: {item.minWeight}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                {item.hindiName || '—'}
                              </div>
                            </td>

                            {/* Category */}
                            <td style={{ padding: '0.75rem 0.75rem' }}>
                              <span className="badge badge-primary" style={{ textTransform: 'capitalize', fontSize: '0.7rem' }}>
                                {item.category}
                              </span>
                            </td>

                            {/* Unit */}
                            <td style={{ padding: '0.75rem 0.75rem' }}>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: item.unit === 'unit' ? '#FEF3C7' : '#E0E7FF',
                                color: item.unit === 'unit' ? '#92400E' : '#3730A3'
                              }}>
                                /{item.unit || 'kg'}
                              </span>
                            </td>

                            {/* Current Rate */}
                            <td style={{ padding: '0.75rem 0.75rem', fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                              ₹{item.rate}
                            </td>

                            {/* New Rate Input */}
                            <td style={{ padding: '0.75rem 0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontWeight: 700, color: '#64748B', fontSize: '0.8rem' }}>₹</span>
                                <input
                                  type="number"
                                  min="1"
                                  step="1"
                                  value={currentVal}
                                  onChange={(e) => handleRateInputChange(item.id, e.target.value)}
                                  style={{
                                    width: '75px',
                                    padding: '4px 6px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: isChanged ? '1.5px solid var(--color-primary)' : '1px solid #CBD5E1',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    background: '#FFFFFF'
                                  }}
                                />
                              </div>
                            </td>

                            {/* Trend Selector */}
                            <td style={{ padding: '0.75rem 0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <select
                                  value={currentTrendType}
                                  onChange={(e) => handleTrendTypeChange(item.id, e.target.value)}
                                  style={{
                                    padding: '3px 6px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid #CBD5E1',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    background:
                                      currentTrendType === 'up' ? '#ECFDF5' :
                                        currentTrendType === 'down' ? '#FEF2F2' : '#F8FAFC',
                                    color:
                                      currentTrendType === 'up' ? '#065F46' :
                                        currentTrendType === 'down' ? '#991B1B' : '#475569'
                                  }}
                                >
                                  <option value="stable">━ Stable</option>
                                  <option value="up">↗ High (Bullish)</option>
                                  <option value="down">↘ Low (Bearish)</option>
                                </select>
                              </div>
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                  onClick={() => handleSaveRate(item)}
                                  className={`btn ${isChanged ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                  style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: 700 }}
                                  title="Save price change to live database"
                                >
                                  <Save size={12} />
                                  <span>{isChanged ? 'Save' : 'Update'}</span>
                                </button>

                                <button
                                  onClick={() => setEditingScrapItem({ ...item })}
                                  style={{
                                    padding: '4px 7px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid #CBD5E1',
                                    background: '#FFFFFF',
                                    color: '#475569',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    display: 'inline-flex',
                                    alignItems: 'center'
                                  }}
                                  title="Edit full item metadata (Hindi name, CO2 metrics, description)"
                                >
                                  <Edit2 size={12} />
                                </button>

                                <button
                                  onClick={() => setDeleteConfirmScrapId(item.id)}
                                  style={{
                                    padding: '4px 7px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid #FECACA',
                                    background: '#FEF2F2',
                                    color: '#DC2626',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    display: 'inline-flex',
                                    alignItems: 'center'
                                  }}
                                  title="Delete item from scrap catalog"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
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
                          ? `Active Atlas cluster: cluster0.xzdc97o.mongodb.net • Database: ${dbStatus.dbName || 'kabadcollect'} • Latency: ${dbStatus.pingMs || 35}ms`
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
                          placeholder="mongodb+srv://user:password@cluster0.xzdc97o.mongodb.net/kabadcollect"
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
                    MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.mongodb.net/kabadcollect?retryWrites=true&amp;w=majority
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SUB-MODAL 1: ADD NEW SCRAP ITEM MODAL */}
        {/* ========================================================================= */}
        {isAddScrapModalOpen && (
          <div className="modal-overlay" style={{ zIndex: 1300 }} onClick={() => setIsAddScrapModalOpen(false)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '560px', width: '92%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlusCircle size={20} color="var(--color-primary)" />
                  <span>Add New Scrap Item</span>
                </h3>
                <button
                  onClick={() => setIsAddScrapModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateNewScrapSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Item Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pure Copper Wire"
                      value={newScrapForm.name}
                      onChange={(e) => setNewScrapForm({ ...newScrapForm, name: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Hindi Name / Local Term
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. तांबा (Copper Wire)"
                      value={newScrapForm.hindiName}
                      onChange={(e) => setNewScrapForm({ ...newScrapForm, hindiName: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Category *
                    </label>
                    <select
                      value={newScrapForm.category}
                      onChange={(e) => setNewScrapForm({ ...newScrapForm, category: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem', background: '#FFFFFF' }}
                    >
                      <option value="paper">📄 Paper & Cardboard</option>
                      <option value="plastic">🧴 Plastics</option>
                      <option value="metal">🔩 Metals</option>
                      <option value="ewaste">💻 E-Waste & Appliances</option>
                      <option value="battery">🔋 Vehicles & Batteries</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Base Rate (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.5"
                      placeholder="e.g. 430"
                      value={newScrapForm.rate}
                      onChange={(e) => setNewScrapForm({ ...newScrapForm, rate: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Unit Type *
                    </label>
                    <select
                      value={newScrapForm.unit}
                      onChange={(e) => setNewScrapForm({ ...newScrapForm, unit: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem', background: '#FFFFFF' }}
                    >
                      <option value="kg">₹ / kg (Weight)</option>
                      <option value="unit">₹ / unit (Piece/Count)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Min Pickup Quantity
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5 kg or 1 unit"
                      value={newScrapForm.minWeight}
                      onChange={(e) => setNewScrapForm({ ...newScrapForm, minWeight: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Daily Market Trend
                    </label>
                    <select
                      value={newScrapForm.trendType}
                      onChange={(e) => setNewScrapForm({
                        ...newScrapForm,
                        trendType: e.target.value,
                        trend: e.target.value === 'up' ? '+₹2.00 today' : e.target.value === 'down' ? '-₹1.00 today' : 'Stable'
                      })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem', background: '#FFFFFF' }}
                    >
                      <option value="stable">━ Stable Market</option>
                      <option value="up">↗ Bullish / Up</option>
                      <option value="down">↘ Bearish / Down</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Item Description / Condition Guidelines
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Stripped copper wire with no plastic insulation, or clean aluminum vessels."
                    value={newScrapForm.description}
                    onChange={(e) => setNewScrapForm({ ...newScrapForm, description: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Eco impact factor inputs */}
                <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={13} />
                    <span>Environmental Recycling Factors (Per kg)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>CO₂ Saved (kg)</span>
                      <input
                        type="number"
                        step="0.1"
                        value={newScrapForm.co2SavedPerKg}
                        onChange={(e) => setNewScrapForm({ ...newScrapForm, co2SavedPerKg: e.target.value })}
                        style={{ width: '100%', padding: '4px 6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Water Saved (L)</span>
                      <input
                        type="number"
                        step="1"
                        value={newScrapForm.waterSavedPerKg}
                        onChange={(e) => setNewScrapForm({ ...newScrapForm, waterSavedPerKg: e.target.value })}
                        style={{ width: '100%', padding: '4px 6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Trees Saved</span>
                      <input
                        type="number"
                        step="0.001"
                        value={newScrapForm.treesSavedPerKg}
                        onChange={(e) => setNewScrapForm({ ...newScrapForm, treesSavedPerKg: e.target.value })}
                        style={{ width: '100%', padding: '4px 6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #CBD5E1' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddScrapModalOpen(false)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '8px 20px', fontWeight: 700 }}
                  >
                    Create Scrap Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-MODAL 2: EDIT FULL SCRAP ITEM METADATA */}
        {/* ========================================================================= */}
        {editingScrapItem && (
          <div className="modal-overlay" style={{ zIndex: 1300 }} onClick={() => setEditingScrapItem(null)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '560px', width: '92%', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit2 size={18} color="var(--color-primary)" />
                  <span>Edit Scrap Item Details</span>
                </h3>
                <button
                  onClick={() => setEditingScrapItem(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEditScrapSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Item Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingScrapItem.name}
                      onChange={(e) => setEditingScrapItem({ ...editingScrapItem, name: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Hindi Name / Local Label
                    </label>
                    <input
                      type="text"
                      value={editingScrapItem.hindiName || ''}
                      onChange={(e) => setEditingScrapItem({ ...editingScrapItem, hindiName: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Category
                    </label>
                    <select
                      value={editingScrapItem.category}
                      onChange={(e) => setEditingScrapItem({ ...editingScrapItem, category: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem', background: '#FFFFFF' }}
                    >
                      <option value="paper">📄 Paper & Cardboard</option>
                      <option value="plastic">🧴 Plastics</option>
                      <option value="metal">🔩 Metals</option>
                      <option value="ewaste">💻 E-Waste & Appliances</option>
                      <option value="battery">🔋 Vehicles & Batteries</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Rate (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.5"
                      value={editingScrapItem.rate}
                      onChange={(e) => setEditingScrapItem({ ...editingScrapItem, rate: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Unit
                    </label>
                    <select
                      value={editingScrapItem.unit || 'kg'}
                      onChange={(e) => setEditingScrapItem({ ...editingScrapItem, unit: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem', background: '#FFFFFF' }}
                    >
                      <option value="kg">₹ / kg</option>
                      <option value="unit">₹ / unit</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Min Pickup
                    </label>
                    <input
                      type="text"
                      value={editingScrapItem.minWeight || ''}
                      onChange={(e) => setEditingScrapItem({ ...editingScrapItem, minWeight: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Trend Label (e.g. +₹2.00 today)
                    </label>
                    <input
                      type="text"
                      value={editingScrapItem.trend || 'Stable'}
                      onChange={(e) => setEditingScrapItem({ ...editingScrapItem, trend: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingScrapItem.description || ''}
                    onChange={(e) => setEditingScrapItem({ ...editingScrapItem, description: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditingScrapItem(null)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '8px 20px', fontWeight: 700 }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-MODAL 3: BULK CATEGORY RATE ADJUSTER */}
        {/* ========================================================================= */}
        {isBulkAdjustModalOpen && (
          <div className="modal-overlay" style={{ zIndex: 1300 }} onClick={() => setIsBulkAdjustModalOpen(false)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '520px', width: '92%', padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={20} color="#4338CA" />
                  <span>Bulk Margin & Price Adjuster</span>
                </h3>
                <button
                  onClick={() => setIsBulkAdjustModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleExecuteBulkAdjust} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ margin: 0, fontSize: '0.825rem', color: '#64748B' }}>
                  Apply market-wide price corrections across all items in a selected category simultaneously.
                </p>

                <div>
                  <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Target Category
                  </label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem', background: '#FFFFFF' }}
                  >
                    <option value="all">🌐 All Categories (Entire Catalog)</option>
                    <option value="metal">🔩 Metals (Iron, Copper, Brass, Steel)</option>
                    <option value="paper">📄 Paper & Cardboard</option>
                    <option value="plastic">🧴 Plastics</option>
                    <option value="ewaste">💻 E-Waste & Appliances</option>
                    <option value="battery">🔋 Vehicles & Batteries</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Adjustment Type
                    </label>
                    <div style={{ display: 'flex', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid #CBD5E1' }}>
                      <button
                        type="button"
                        onClick={() => setBulkAdjustmentType('percent')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: 'none',
                          background: bulkAdjustmentType === 'percent' ? '#4338CA' : '#F8FAFC',
                          color: bulkAdjustmentType === 'percent' ? '#FFFFFF' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        Percentage (%)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkAdjustmentType('amount')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          border: 'none',
                          background: bulkAdjustmentType === 'amount' ? '#4338CA' : '#F8FAFC',
                          color: bulkAdjustmentType === 'amount' ? '#FFFFFF' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        Flat Amount (₹)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.785rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Change Value
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <select
                        value={bulkAdjustmentSign}
                        onChange={(e) => setBulkAdjustmentSign(e.target.value)}
                        style={{
                          width: '60px',
                          padding: '8px 4px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid #CBD5E1',
                          fontWeight: 800,
                          background: bulkAdjustmentSign === '+' ? '#ECFDF5' : '#FEF2F2',
                          color: bulkAdjustmentSign === '+' ? '#047857' : '#B91C1C'
                        }}
                      >
                        <option value="+">+ (Up)</option>
                        <option value="-">- (Down)</option>
                      </select>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        required
                        value={bulkAdjustmentValue}
                        onChange={(e) => setBulkAdjustmentValue(e.target.value)}
                        style={{ flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: 800 }}
                      />
                      <span style={{ fontWeight: 700, color: '#64748B', fontSize: '0.85rem' }}>
                        {bulkAdjustmentType === 'percent' ? '%' : '₹'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preview Box */}
                <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    📊 Impact Preview:
                  </div>
                  <div style={{ fontSize: '0.785rem', color: '#64748B', lineHeight: 1.5 }}>
                    {bulkCategory === 'all' ? 'All catalog items' : `All ${bulkCategory.toUpperCase()} items`} will receive a{' '}
                    <strong style={{ color: bulkAdjustmentSign === '+' ? '#047857' : '#B91C1C' }}>
                      {bulkAdjustmentSign}{bulkAdjustmentValue}{bulkAdjustmentType === 'percent' ? '%' : ' ₹'}
                    </strong>{' '}
                    price update.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsBulkAdjustModalOpen(false)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: '8px 20px', fontWeight: 700, background: '#4338CA', borderColor: '#4338CA' }}
                  >
                    Apply Bulk Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-MODAL 4: DELETE SCRAP CONFIRMATION MODAL */}
        {/* ========================================================================= */}
        {deleteConfirmScrapId && (
          <div className="modal-overlay" style={{ zIndex: 1300 }} onClick={() => setDeleteConfirmScrapId(null)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '440px', width: '90%', padding: '1.5rem', textAlign: 'center' }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Trash2 size={24} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Delete Scrap Item?
              </h3>
              <p style={{ margin: '0 0 1.25rem', fontSize: '0.825rem', color: '#64748B' }}>
                Are you sure you want to remove this item from the active scrap catalog? Customers won't be able to select it for new bookings.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmScrapId(null)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteScrapConfirmed(deleteConfirmScrapId)}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', background: '#DC2626', borderColor: '#DC2626', fontWeight: 700 }}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
