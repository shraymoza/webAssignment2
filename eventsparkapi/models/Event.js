import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    _id: String,                     // evt_*****
    title: { type: String, required: true },
    venueId: { type: String, required: true },
    startAt: { type: Date, required: true },
    endAt: Date,
    bannerUrl: String,
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
