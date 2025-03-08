// src/server.ts
import app from './app';

// Only start the server if we're not in production (Vercel handles this in prod)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;