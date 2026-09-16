import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * Hash password using Node native crypto scrypt with random salt
 */
export function hashPassword(password) {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored salt:hash
 */
export function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  const parts = storedHash.split(':');
  if (parts.length !== 2) {
    // Fallback for plain-text or direct match
    return password === storedHash;
  }
  const [salt, originalHash] = parts;
  try {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch (err) {
    return false;
  }
}

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
  userId: {
    type: String,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false,
    select: false // excluded by default in queries for security
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'agent', 'partner', 'admin'],
    default: 'user',
    index: true
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
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
  co2SavedKg: {
    type: Number,
    default: 0
  },
  treesSaved: {
    type: Number,
    default: 0
  },
  savedAddresses: [AddressSchema]
}, {
  strict: false,
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
