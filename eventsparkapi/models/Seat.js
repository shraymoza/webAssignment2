import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema({
    _id: String,                     // sea_*****
    eventId: { type: String, ref: 'Event', required: true, index: true },
    row: Number,
    col: Number,
    price: Number,
    status: { type: String, enum: ['AVAILABLE','HELD','SOLD'], default: 'AVAILABLE' },
    heldBy: String,
}, { timestamps: true });

seatSchema.index({ eventId: 1, status: 1 });
export default mongoose.model('Seat', seatSchema);
