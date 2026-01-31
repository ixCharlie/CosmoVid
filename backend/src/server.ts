import express from 'express';
import cors from 'cors';
import { downloadRouter } from './routes/download';
import { proxyRouter } from './routes/proxy';
import { PORT } from './config';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/download', proxyRouter);
app.use('/api', downloadRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
