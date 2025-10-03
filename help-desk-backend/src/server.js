import app from './app.js';
import { ENV } from './config/env.js';


app.listen(ENV.PORT, '0.0.0.0', () => console.log('up'));

