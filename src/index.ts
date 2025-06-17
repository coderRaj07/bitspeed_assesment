import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import identifyRouter from './routes/identify';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/identify', identifyRouter);

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Server is running' });
});

// ✅ Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Global Error:', err.stack || err.message || err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app
