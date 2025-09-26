import app from './app.js';
import { ENV } from './config/env.js';

app.listen(ENV.PORT, () => {
  console.log(`API rodando em http://localhost:${ENV.PORT} (${ENV.NODE_ENV})`);
});
