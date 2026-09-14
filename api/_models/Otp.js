import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  otp: {
    type: String,
    required: true,
    trim: true
  },
  purpose: {
    type: String,
    enum: ['login', 'register'],
    default: 'login'
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // MongoDB TTL index for automatic expiration
  }
}, {
  timestamps: true
});

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
