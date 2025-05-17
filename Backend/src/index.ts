import express from 'express';
import { connectDB } from './config/db';
import cors from 'cors';
import authRouter from './routers/auth.router';
import invoiceRoute from './routers/invoice.router';

const app = express();
const PORT = process.env.PORT || 5000;

// Update CORS configuration
app.use(cors({
  origin: 'https://wavenet-solutions.vercel.app', // Specific origin instead of wildcard
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token']
}));

app.use(express.json());

// Route configuration
app.use('/api', authRouter);
app.use('/api/invoices', invoiceRoute);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
