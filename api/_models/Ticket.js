import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  ticketId: {
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
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: String,
    required: true,
    default: 'Pickup Issue'
  },
  orderId: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'OPEN',
    index: true
  },
  estimatedResolution: {
    type: String,
    default: 'Under 15 minutes'
  }
}, {
  strict: false,
  timestamps: true
});

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
