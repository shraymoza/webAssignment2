import express from 'express';
import { z } from 'zod';
import Event from '../models/Event.js';
import Seat from '../models/Seat.js';
import auth from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();
const paramSchema = z.object({ eventId: z.string().startsWith('evt_') });

router.get('/events/:eventId/seatmap', auth('optional'), async (req, res, next) => {
    try {
        const { eventId } = paramSchema.parse(req.params);
        const event = await Event.findById(eventId).lean();
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const seats = await Seat.find({ eventId }).lean();
        if (req.query.hold === 'Y' && req.user) {
            const session = await mongoose.startSession();
            await session.withTransaction(async () => {
                await Seat.updateMany({ eventId, status: 'AVAILABLE' }, { status: 'HELD', heldBy: req.user.id }, { session });
            });
            seats.forEach(s => { if (s.status === 'AVAILABLE') s.status = 'HELD'; });
        }
        res.json({ eventId, venueId: event.venueId, seats });
    } catch (e) { next(e); }
});

export default router;
