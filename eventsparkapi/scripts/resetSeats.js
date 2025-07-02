import mongoose from 'mongoose';
import dotenv   from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const Seat = mongoose.model('Seat', new mongoose.Schema({}, { strict: false, collection: 'seats' }));

const { modifiedCount } = await Seat.updateMany(
    { eventId: 'evt_demo123' },
    { $set: { status: 'AVAILABLE', heldBy: null } },
);
console.log('Reset seats →', modifiedCount);
process.exit(0);

