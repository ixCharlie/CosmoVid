import express from 'express';
import cors from 'cors';
import { downloadRouter } from './routes/download';
import { proxyRouter } from './routes/proxy';
import { shrinkRouter } from './routes/shrink';
import { PORT } from './config';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// POST /api/download -> downloadRouter; GET /api/download/proxy -> proxyRouter (mounted under /download)
downloadRouter.use('/download', proxyRouter);
app.use('/api', downloadRouter);
// GET /api/shrink/limit, POST /api/shrink (multipart video)
app.use('/api/shrink', shrinkRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
