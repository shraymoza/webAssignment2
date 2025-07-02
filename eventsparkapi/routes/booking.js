// routes/booking.js
import express from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';

import Booking from '../models/Booking.js';
import Seat    from '../models/Seat.js';
import auth    from '../middleware/auth.js';

const router = express.Router();

/* ---------- validation ---------- */
const bodySchema = z.object({
    seatIds: z.array(z.string().startsWith('sea_')).min(1),
});

/* ---------- POST /events/:eventId/bookings ---------- */
router.post(
    '/events/:eventId/bookings',
    auth('user'),
    async (req, res, next) => {
        /* 1. validate -------------------------------------------------------- */
        const parsed = bodySchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ errors: parsed.error.errors });
        }
        const { seatIds } = parsed.data;
        const { eventId } = req.params;

        /* 2. transaction ----------------------------------------------------- */
        const session = await mongoose.startSession();
        try {
            let booking;

            await session.withTransaction(async () => {
                /* 2-a  fetch seats that are either AVAILABLE
                        OR already HELD by this user  */
                const seats = await Seat.find({
                    _id:   { $in: seatIds },
                    eventId,
                    $or: [
                        { status: 'AVAILABLE'               },
                        { status: 'HELD', heldBy: req.user.id },
                    ],
                }).session(session);

                if (seats.length !== seatIds.length) {
                    throw new Error('Some seats unavailable');
                }

                /* 2-b  mark/remark them as HELD by the user so the op is idempotent */
                await Seat.updateMany(
                    { _id: { $in: seatIds } },
                    { status: 'HELD', heldBy: req.user.id },
                    { session },
                );

                /* 2-c  create the booking doc */
                const total = seats.reduce((sum, s) => sum + s.price, 0);
                [booking]  = await Booking.create([{
                    _id:       `bok_${uuid()}`,
                    userId:    req.user.id,
                    eventId,
                    seatIds,
                    total,
                    expiresAt: dayjs().add(15, 'minutes').toDate(),
                }], { session });
            });

            /* 3. success ------------------------------------------------------- */
            return res.status(201).json({
                bookingId: booking._id,
                status:    booking.status,
                expiresAt: booking.expiresAt,
            });
        } catch (err) {
            if (err.message.includes('unavailable')) {
                return res.status(409).json({ message: err.message });
            }
            return next(err);
        } finally {
            session.endSession();
        }
    },
);

/* ---------- GET /bookings/:bookingId (owner-only) ---------- */
    router.get(
          '/bookings/:bookingId',
          auth('user'),
          async (req, res, next) => {
        try {
              const booking = await Booking.findById(req.params.bookingId).lean();
              if (!booking) return res.status(404).json({ message: 'Not found' });
              if (booking.userId !== req.user.id) {
                    return res.status(403).json({ message: 'Forbidden' });
                  }
              res.json(booking);
            } catch (e) { next(e); }
      },
);

    /* ---------- DELETE /bookings/:bookingId (cancel) ---------- */
        router.delete(
              '/bookings/:bookingId',
              auth('user'),
              async (req, res, next) => {
        try {
              const booking = await Booking.findById(req.params.bookingId);
              if (!booking)  return res.status(404).json({ message: 'Not found' });
              if (booking.userId !== req.user.id) {
                    return res.status(403).json({ message: 'Forbidden' });
                  }
        
                  // release seats
                      await Seat.updateMany(
                            { _id: { $in: booking.seatIds } },
                            { status: 'AVAILABLE', heldBy: null },
                          );
              await booking.deleteOne();
              res.sendStatus(204);
            } catch (e) { next(e); }
      },
);

export default router;
