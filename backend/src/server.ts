import { env } from './config/env';
import app from './app';

app.listen(env.PORT, () => {
  console.log(`\n🏥 ${env.APP_NAME}`);
  console.log(`   → http://localhost:${env.PORT}`);
  console.log(`   → API: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
  console.log(`   → Env: ${env.NODE_ENV}\n`);
});

export default app;
