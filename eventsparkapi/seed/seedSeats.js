import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

import Event from '../models/Event.js';
import Seat from '../models/Seat.js';

await mongoose.connect(process.env.MONGODB_URI);

const eventId = 'evt_demo123';
await Event.deleteMany({ _id: eventId });
await Seat.deleteMany({ eventId });

await Event.create({
    _id: eventId,
    title: 'Rock Night',
    venueId: 'vnu_demo',
    startAt: new Date('2025-12-31T19:00Z'),
});

const rows = 10, cols = 20, basePrice = 50;
const seats = [];
for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
        seats.push({
            _id: `sea_${uuid()}`,
            eventId,
            row: r,
            col: c,
            price: basePrice + (rows - r) * 5,          // front rows pricier
        });
    }
}
await Seat.insertMany(seats);
console.log('Seeded', seats.length, 'seats');
process.exit(0);
