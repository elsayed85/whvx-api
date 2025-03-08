// src/app.ts
import express from 'express';
import scraperRoute from './routes/scraper';

const app = express();

app.use(express.json());
app.use('/api', scraperRoute);

export default app;
