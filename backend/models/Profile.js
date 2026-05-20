import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  experienceLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Pro'], default: 'Intermediate' },
  preferredStyle: [String], // e.g., ['Fly Fishing', 'Bass Tournament', 'Saltwater']
  homeWaters: {
    name: String,
    waterType: { type: String, enum: ['Freshwater', 'Saltwater', 'Brackish'] }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Profile', ProfileSchema);
