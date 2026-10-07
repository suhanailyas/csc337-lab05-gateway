const mongoose = require('mongoose');
module.exports = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ['SuperAdmin', 'Manager', 'Employee'], default: 'Employee' },
  provider: { type: String, default: 'local' },
  providerId: String,
  refreshTokens: [String]
}, { timestamps: true }));