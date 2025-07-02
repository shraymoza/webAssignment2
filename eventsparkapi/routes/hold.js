import express from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import Seat from '../models/Seat.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const bodySchema = z.object({
    seatIds: z.array(z.string().startsWith('sea_')).min(1),
});

router.post('/events/:eventId/holds', auth('user'), async (req, res, next) => {
    const { seatIds } = bodySchema.parse(req.body);
    const { eventId } = req.params;

    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            // only lock requested seats
            const result = await Seat.updateMany(
                { _id: { $in: seatIds }, eventId, status: 'AVAILABLE' },
                { status: 'HELD', heldBy: req.user.id },
                { session }
            );
            if (result.matchedCount !== seatIds.length) throw new Error('Some seats unavailable');
        });

        res.status(200).json({ held: seatIds });
    } catch (e) {
        next(e.message === 'Some seats unavailable'
            ? { status: 409, message: e.message }
            : e);
    } finally { session.endSession(); }
});

export default router;
