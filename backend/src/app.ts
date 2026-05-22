import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes';
import productRouter from './routes/product.routes';
import cartRouter from './routes/cart.routes';
import orderRouter from './routes/order.routes';
import addressRouter from './routes/address.routes';
import reviewRouter from './routes/review.routes';
import wishlistRouter from './routes/wishlist.routes';
import couponRouter from './routes/coupon.routes';
import adminRouter from './routes/admin.routes';
import { errorHandler } from './middleware/error';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Luxe Blooms API is healthy and blooming!' });
});

// Route Registrations
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/addresses', addressRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/admin', adminRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
