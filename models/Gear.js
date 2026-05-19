import mongoose from 'mongoose';

const GearSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['Lure','Rod', 'Reel', 'Line', 'Terminal Tackle'], required: true },
  brand: String,
  color: String,
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed }, 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Gear', GearSchema);