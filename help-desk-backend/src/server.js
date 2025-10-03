import app from './app.js';
import { ENV } from './config/env.js';

const host = '0.0.0.0';
app.listen(ENV.PORT, host, () => {
	console.log(`up on http://${host}:${ENV.PORT}`);
});

