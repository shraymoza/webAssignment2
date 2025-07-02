import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    _id: String,                     // bok_*****
    userId: { type: String, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    seatIds: [String],
    total: Number,
    status: { type: String, enum: ['PENDING_PAYMENT','CONFIRMED','CANCELLED'], default: 'PENDING_PAYMENT' },
    expiresAt: Date,
}, { timestamps: true });

bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL
export default mongoose.model('Booking', bookingSchema);
