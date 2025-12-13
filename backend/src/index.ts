// Main Cloudflare Worker entry point

import { createRouter } from './router';

const app = createRouter();

export default app;
