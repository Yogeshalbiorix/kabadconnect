import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  id: String,
  label: String,
  address: String,
  city: String,
  pincode: String,
  isDefault: Boolean
}, { _id: false });

const UserSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true,
    index: true
  },
  phone: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'agent', 'partner', 'admin'],
    default: 'user',
    index: true
  },
  avatar: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: 'Delhi NCR'
  },
  state: {
    type: String,
    default: ''
  },
  pincode: {
    type: String,
    default: ''
  },
  upiId: {
    type: String,
    default: ''
  },
  agentCode: String,
  gstin: String,
  totalEarned: {
    type: Number,
    default: 0
  },
  totalRecycledKg: {
    type: Number,
    default: 0
  },
  savedAddresses: [AddressSchema]
}, {
  strict: false,
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
