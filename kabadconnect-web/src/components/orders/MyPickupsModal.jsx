import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Edit3, 
  RotateCcw, 
  Phone, 
  ChevronRight,
  Plus,
  Scale
} from 'lucide-react';

export const MyPickupsModal = ({ 
  isOpen, 
  onClose, 
  orders = [], 
  onCancelOrder, 
  onUpdateOrder, 
  onTrackOrder, 
  onOpenBooking,
  onReorder = null,
  onOpenDoorstepVerification = null 
}) => {
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'active', 'completed', 'cancelled'
  
  // State for cancelling an order
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // State for editing / rescheduling an order
  const [editingOrder, setEditingOrder] = useState(null);
  const [editSlot, setEditSlot] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNotes, setEditNotes] = useState('');

  if (!isOpen) return null;

  const isActiveOrder = (status) => {
    const s = (status || '').toLowerCase();
    return s !== 'completed' && s !== 'cancelled';
  };
  const isCompletedOrder = (status) => (status || '').toLowerCase() === 'completed';
  const isCancelledOrder = (status) => (status || '').toLowerCase() === 'cancelled';

  const filteredOrders = orders.filter((order) => {
    if (filterTab === 'active') return isActiveOrder(order.status);
    if (filterTab === 'completed') return isCompletedOrder(order.status);
    if (filterTab === 'cancelled') return isCancelledOrder(order.status);
    return true;
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'in_transit':
      case 'en_route':
        return <span className="badge badge-primary"><Truck size={12} /> In Transit</span>;
      case 'completed':
        return <span className="badge badge-success"><CheckCircle2 size={12} /> Completed</span>;
      case 'cancelled':
        return <span className="badge badge-danger"><XCircle size={12} /> Cancelled</span>;
      case 'assigned':
        return <span className="badge badge-warning"><Clock size={12} /> Partner Assigned</span>;
      case 'weighing':
        return <span className="badge badge-primary"><Scale size={12} /> Weighing Scrap</span>;
      default:
        return <span className="badge badge-secondary"><Clock size={12} /> Pending</span>;
    }
  };

  const handleConfirmCancel = () => {
    if (cancellingOrderId) {
      onCancelOrder(cancellingOrderId, cancelReason || 'Cancelled by customer');
      setCancellingOrderId(null);
      setCancelReason('');
    }
  };

  const handleStartEdit = (order) => {
    setEditingOrder(order);
    setEditSlot(order.scheduledSlot || 'Today Express (Within 2 Hours)');
    setEditAddress(order.address || '');
    setEditNotes(order.notes || '');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editingOrder) {
      onUpdateOrder(editingOrder.id, {
        scheduledSlot: editSlot,
        address: editAddress,
        notes: editNotes
      });
      setEditingOrder(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1150 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '740px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--color-accent-mint-soft)',
              color: 'var(--color-accent-mint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Truck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                My Pickup Bookings
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Manage, reschedule, track or cancel your doorstep scrap pickups
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => {
                onClose();
                onOpenBooking();
              }}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              <Plus size={14} />
              <span>Book New</span>
            </button>
            <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="no-scrollbar" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.85rem 1.5rem',
          background: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {[
            { id: 'all', label: 'All Pickups', count: orders.length },
            { id: 'active', label: 'Active', count: orders.filter(o => isActiveOrder(o.status)).length },
            { id: 'completed', label: 'Completed', count: orders.filter(o => isCompletedOrder(o.status)).length },
            { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => isCancelledOrder(o.status)).length }
          ].map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.825rem',
                  fontWeight: isActive ? 700 : 600,
                  border: '1.5px solid',
                  borderColor: isActive ? 'var(--color-primary)' : 'var(--color-border)',
                  background: isActive ? 'var(--color-primary)' : 'var(--color-bg)',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 2px 8px rgba(13, 92, 58, 0.2)' : 'none'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '0.725rem',
                  fontWeight: 800,
                  padding: '1px 7px',
                  borderRadius: '999px',
                  background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#E2E8F0',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-muted)'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--color-text-muted)' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--color-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <Calendar size={28} color="var(--color-text-muted)" />
              </div>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginBottom: '0.35rem' }}>
                No Bookings Found in this Filter
              </h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '340px', margin: '0 auto 1.5rem auto' }}>
                You have no {filterTab !== 'all' ? filterTab : ''} doorstep scrap pickups.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenBooking();
                }}
                className="btn btn-primary btn-sm"
              >
                Schedule Doorstep Pickup
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const canCancelOrUpdate = order.status !== 'completed' && order.status !== 'cancelled';

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Card Header: ID, Status, Date */}
                  <div className="flex-between" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                        {order.id}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      Booked {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  {/* Card Details Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.85rem',
                    fontSize: '0.85rem'
                  }}>
                    {/* Slot */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <Clock size={16} color="var(--color-accent-mint)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>Scheduled Slot</div>
                        <strong>{order.scheduledSlot}</strong>
                      </div>
                    </div>

                    {/* Address */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <MapPin size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>Pickup Doorstep</div>
                        <span style={{ color: 'var(--color-text-secondary)', display: 'block', maxWidth: '280px' }}>
                          {order.address} {order.pincode ? `(${order.pincode})` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Scrap & Amount */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <Scale size={16} color={order.status === 'completed' ? 'var(--color-accent-mint)' : 'var(--color-accent-gold)'} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>
                          {order.status === 'completed' ? 'Final Paid Value' : 'Est. Weight & Value'}
                        </div>
                        <strong>
                          {order.status === 'completed' && order.doorstepVerification?.verifiedWeight 
                            ? `${order.doorstepVerification.verifiedWeight} kg` 
                            : order.estimatedWeight}
                        </strong> • <strong style={{ color: order.status === 'completed' ? '#059669' : 'var(--color-primary)' }}>
                          ₹{(order.status === 'completed' 
                            ? (order.totalPaid || order.doorstepVerification?.paidAmount || order.paidAmount || order.estimatedAmount) 
                            : (order.estimatedAmount || order.totalPaid))}
                        </strong>
                        {order.status === 'completed' && (
                          <span style={{
                            marginLeft: '6px',
                            fontSize: '0.7rem',
                            background: '#DCFCE7',
                            color: '#166534',
                            border: '1px solid #86EFAC',
                            padding: '1px 6px',
                            borderRadius: '999px',
                            fontWeight: 700
                          }}>
                            ✓ Paid
                          </span>
                        )}
                        {order.itemsWeighed && order.itemsWeighed.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                            {order.itemsWeighed.map((it, idx) => (
                              <span key={idx} style={{
                                fontSize: '0.68rem',
                                background: '#F1F5F9',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                                padding: '1px 5px',
                                color: '#334155'
                              }}>
                                {it.name} ({typeof it.weight === 'string' && it.weight.includes('kg') ? it.weight : `${it.weight} kg`})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Assigned Collector */}
                    {order.kabadwala && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <img 
                          src={order.kabadwala.photo} 
                          alt={order.kabadwala.name} 
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>Assigned Collector</div>
                          <strong>{order.kabadwala.name}</strong>
                          <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>{order.kabadwala.phone}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Doorstep OTP Badge if active */}
                  {order.doorstepVerification?.otp && order.status !== 'completed' && (
                    <div style={{
                      padding: '0.65rem 0.85rem',
                      background: '#FEF3C7',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #F59E0B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      fontSize: '0.8rem'
                    }}>
                      <div>
                        <span style={{ fontWeight: 800, color: '#92400E' }}>Doorstep Verification OTP: </span>
                        <span style={{ color: '#78350F' }}>Share with collector after item check</span>
                      </div>
                      <span style={{
                        background: '#FFFFFF',
                        color: '#92400E',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        letterSpacing: '2px',
                        border: '1px solid #FDE68A'
                      }}>
                        {order.doorstepVerification.otp}
                      </span>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px dashed var(--color-border)',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {/* Live Tracker & Doorstep Verify Buttons */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          onTrackOrder(order);
                          onClose();
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.785rem' }}
                      >
                        <Truck size={14} color="var(--color-accent-mint)" />
                        <span>{order.status === 'completed' ? 'View Final Receipt' : 'Live Tracking & Route'}</span>
                      </button>

                      {canCancelOrUpdate && onOpenDoorstepVerification && (
                        <button
                          onClick={() => {
                            onOpenDoorstepVerification(order);
                            onClose();
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.785rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Scale size={13} />
                          <span>Doorstep Inspect & Pay</span>
                        </button>
                      )}
                    </div>

                    {/* Cancellation & Update actions */}
                    {canCancelOrUpdate ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleStartEdit(order)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.785rem', color: 'var(--color-primary)' }}
                        >
                          <Edit3 size={13} />
                          <span>Update Slot / Address</span>
                        </button>

                        <button
                          onClick={() => setCancellingOrderId(order.id)}
                          className="btn btn-sm"
                          style={{
                            fontSize: '0.785rem',
                            background: '#FEE2E2',
                            color: '#DC2626',
                            border: '1px solid #FCA5A5'
                          }}
                        >
                          <XCircle size={13} />
                          <span>Cancel Pickup</span>
                        </button>
                      </div>
                    ) : order.status === 'cancelled' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600 }}>
                          ❌ Cancelled
                        </span>
                        <button
                          onClick={() => {
                            if (onReorder) onReorder(order);
                            else { onClose(); onOpenBooking(); }
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.785rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          title="Reorder this scrap pickup with same items and address"
                        >
                          <RotateCcw size={13} />
                          <span>Reorder Pickup</span>
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-mint)', fontWeight: 700 }}>
                          ✓ Completed & Paid
                        </span>
                        <button
                          onClick={() => {
                            if (onReorder) onReorder(order);
                            else { onClose(); onOpenBooking(); }
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.785rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          title="Reorder this scrap pickup with same items and address"
                        >
                          <RotateCcw size={13} />
                          <span>Reorder Pickup</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Sub-view: Cancel Confirmation Dialog */}
        {cancellingOrderId && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 1200
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              maxWidth: '440px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              animation: 'scaleUp 0.2s ease'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <AlertCircle size={26} />
              </div>

              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.35rem', color: '#0F172A' }}>
                Cancel Pickup Booking?
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                Are you sure you want to cancel booking <strong>{cancellingOrderId}</strong>? Your assigned scrap collector will be released.
              </p>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Reason for cancellation (optional):</label>
                <select 
                  className="form-input"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="">Select a reason</option>
                  <option value="Need to reschedule for another day">Need to reschedule for another day</option>
                  <option value="Scrap quantity changed significantly">Scrap quantity changed significantly</option>
                  <option value="Already disposed / sold locally">Already disposed / sold locally</option>
                  <option value="Personal emergency / not at home">Personal emergency / not at home</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setCancellingOrderId(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="btn btn-sm"
                  style={{ background: '#DC2626', color: '#FFFFFF', border: 'none' }}
                >
                  Yes, Cancel Pickup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Sub-view: Edit / Update Booking Dialog */}
        {editingOrder && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 1200
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              maxWidth: '480px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              animation: 'scaleUp 0.2s ease'
            }}>
              <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Edit3 size={20} color="var(--color-primary)" />
                  <h4 style={{ fontSize: '1.15rem', margin: 0 }}>
                    Update Booking: {editingOrder.id}
                  </h4>
                </div>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="modal-close-btn"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Reschedule Time Slot</label>
                  <select
                    className="form-input"
                    value={editSlot}
                    onChange={(e) => setEditSlot(e.target.value)}
                  >
                    <option value="Today Express (Within 2 Hours)">⚡ Today Express (Within 2 Hours)</option>
                    <option value="Tomorrow Morning (9:00 AM - 12:00 PM)">Tomorrow Morning (9:00 AM - 12:00 PM)</option>
                    <option value="Tomorrow Afternoon (2:00 PM - 5:00 PM)">Tomorrow Afternoon (2:00 PM - 5:00 PM)</option>
                    <option value="Upcoming Sunday Slot (10:00 AM - 1:00 PM)">Upcoming Sunday Slot (10:00 AM - 1:00 PM)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Doorstep Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Notes for Collector</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 4th floor, please bring extra gunny bags"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
