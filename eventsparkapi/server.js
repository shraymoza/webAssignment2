import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import holdRoutes from './routes/hold.js';
import eventRoutes from './routes/event.js';
import bookingRoutes from './routes/booking.js';

const app = express();
app.use(express.json());

app.use(eventRoutes);
app.use(bookingRoutes);
app.use(holdRoutes);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
});

await mongoose.connect(process.env.MONGODB_URI);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API up on :${PORT}`));
