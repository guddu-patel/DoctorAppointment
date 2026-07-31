import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
  })
);
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: `${env.APP_NAME} is running`,
    version: env.API_VERSION,
    docs: `/api/${env.API_VERSION}/health`,
  });
});

app.use(`/api/${env.API_VERSION}`, routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`\n🏥 ${env.APP_NAME}`);
  console.log(`   → http://localhost:${env.PORT}`);
  console.log(`   → API: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
  console.log(`   → Env: ${env.NODE_ENV}\n`);
});

export default app;
