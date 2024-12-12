const mongoose = require('mongoose');
const User = require('./User');

const BookingSchema = new mongoose.Schema({
  trainer: { type: String, required: true },
  sport: { type: String, required: true },
  time: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ربط المستخدم بالحجز
});

module.exports = mongoose.model('Booking', BookingSchema);
