import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  category: String,
  rate: Number,
  unit: String,
  estimatedWeight: Number
}, { _id: false });

const WeighedItemSchema = new mongoose.Schema({
  name: String,
  weight: String,
  rate: String,
  amount: Number
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    default: '',
    index: true
  },
  customer: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },
    landmark: { type: String, default: '' },
    floor: { type: String, default: '' },
    hasLift: { type: Boolean, default: false }
  },
  categories: {
    type: [String],
    default: ['paper']
  },
  items: [OrderItemSchema],
  itemsWeighed: [WeighedItemSchema],
  estimatedWeight: {
    type: String,
    default: '10-25 kg'
  },
  totalPayout: {
    type: Number,
    default: 0
  },
  totalEstimatedRupees: {
    type: Number,
    default: 0
  },
  scheduledDate: {
    type: String,
    default: 'Today'
  },
  timeSlot: {
    type: String,
    default: '10:00 AM - 12:00 PM'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'en_route', 'in_transit', 'weighing', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  kabadwala: {
    id: String,
    name: String,
    phone: String,
    rating: Number,
    vehicle: String,
    avatar: String
  },
  upiId: {
    type: String,
    default: ''
  },
  doorstepVerification: {
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    inspectedItems: [WeighedItemSchema],
    paymentMethod: { type: String, default: null },
    paymentStatus: { type: String, enum: ['locked', 'pending', 'completed'], default: 'locked' },
    transactionRef: { type: String, default: null },
    paidAmount: { type: Number, default: 0 }
  },
  cancelReason: {
    type: String,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  }
}, {
  strict: false,
  timestamps: true
});

// Avoid recompiling model if already registered in hot-reload/serverless
export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
