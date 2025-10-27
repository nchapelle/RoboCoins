import express from 'express';
import cors from 'cors';
import { env } from './env.js';
import { auth } from './routes/auth.js';
import { upload } from './routes/upload.js';
import { core } from './routes/core.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/auth', auth);
app.use('/upload', upload);
app.use('/api', core);

app.listen(env.PORT, () => {
  console.log(`API listening on :${env.PORT}`);
});