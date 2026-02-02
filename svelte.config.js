import adapter from 'svelte-adapter-azure-swa';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			customStaticWebAppConfig: {
				routes: [
					{ route: '/api/*', allowedRoles: ['authenticated'] }
				],
				navigationFallback: {
					rewrite: '/index.html',
					exclude: ['/api/*', '/_app/*', '/favicon.ico']
				}
			}
		})
	}
};

export default config;
