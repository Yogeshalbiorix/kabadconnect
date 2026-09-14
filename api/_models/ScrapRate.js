import mongoose from 'mongoose';

const ScrapRateSchema = new mongoose.Schema({
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
  hindiName: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  rate: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: 'kg'
  },
  trend: {
    type: String,
    default: 'Stable'
  },
  trendType: {
    type: String,
    enum: ['up', 'down', 'stable'],
    default: 'stable'
  },
  minWeight: {
    type: String,
    default: '5 kg'
  },
  description: {
    type: String,
    default: ''
  },
  co2SavedPerKg: {
    type: Number,
    default: 1.5
  },
  waterSavedPerKg: {
    type: Number,
    default: 20
  },
  treesSavedPerKg: {
    type: Number,
    default: 0.015
  }
}, {
  timestamps: true
});

export default mongoose.models.ScrapRate || mongoose.model('ScrapRate', ScrapRateSchema);
