import mongoose from 'mongoose';

const PartnerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    default: ''
  },
  photo: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 4.8
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  totalPickups: {
    type: Number,
    default: 0
  },
  distanceKm: {
    type: Number,
    default: 1.0
  },
  locality: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    required: true,
    index: true
  },
  coords: {
    type: [Number],
    default: [23.0135, 72.5125]
  },
  vehicle: {
    type: String,
    default: 'Electric Loading E-Rickshaw'
  },
  vehicleReg: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: 'Verified Partner'
  },
  digitalScaleVerified: {
    type: Boolean,
    default: true
  },
  kycVerified: {
    type: Boolean,
    default: true
  },
  operatingSince: {
    type: String,
    default: '2022'
  },
  upiEnabled: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['available', 'en_route', 'busy', 'offline'],
    default: 'available'
  },
  etaMinutes: {
    type: Number,
    default: 15
  },
  recentReview: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.models.Partner || mongoose.model('Partner', PartnerSchema);
