import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
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
  category: {
    type: String,
    default: 'Pickup Issue',
    index: true
  },
  orderId: {
    type: String,
    default: ''
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    default: 'OPEN',
    index: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
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
