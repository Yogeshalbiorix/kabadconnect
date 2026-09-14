import mongoose from 'mongoose';

const MarketplaceItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['furniture', 'appliances', 'cycles', 'electronics', 'upcycled', 'other'],
    index: true
  },
  subcategory: {
    type: String,
    default: '',
    index: true
  }, // e.g. 'almirah', 'table', 'dining-table', 'study-table', 'sofa', 'bed', 'mattress', 'cycle', 'ac'
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  condition: {
    type: String,
    enum: ['brand_new', 'like_new', 'excellent', 'good', 'fair'],
    default: 'good'
  },
  images: {
    type: [String],
    default: []
  },
  city: {
    type: String,
    required: true,
    default: 'Delhi NCR',
    index: true
  },
  locality: {
    type: String,
    default: ''
  },
  seller: {
    id: { type: String, default: 'usr-customer-1' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    whatsapp: { type: String, default: '' },
    email: { type: String, default: '' },
    isVerified: { type: Boolean, default: true }
  },
  itemType: {
    type: String,
    enum: ['second_hand', 'upcycled'],
    default: 'second_hand',
    index: true
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold'],
    default: 'available',
    index: true
  },
  materialsUsed: {
    type: String,
    default: ''
  },
  co2Saved: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: ''
  },
  viewsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.models.MarketplaceItem || mongoose.model('MarketplaceItem', MarketplaceItemSchema);
