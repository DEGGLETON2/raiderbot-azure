import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// Use Node.js runtime for Snowflake SDK compatibility
			runtime: 'nodejs22.x',
			// Split API routes into separate functions for better cold start
			split: true
		})
	}
};

export default config;
