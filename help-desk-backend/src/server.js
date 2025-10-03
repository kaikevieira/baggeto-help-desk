import app from './app.js';
import { ENV } from './config/env.js';

const host = 'uncertain-dione-kaikevieira-a7451037.koyeb.app';
app.listen(ENV.PORT, host, () => {
	console.log(`up on http://${host}:${ENV.PORT}`);
});

