import adapter from 'svelte-adapter-azure-swa';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			customStaticWebAppConfig: {
				routes: [
					{ route: '/svc/*', allowedRoles: ['authenticated'] }
				],
				responseOverrides: {
					'401': {
						redirect: '/.auth/login/aad?post_login_redirect_uri=.referrer',
						statusCode: 302
					}
				},
				auth: {
					identityProviders: {
						azureActiveDirectory: {
							registration: {
								openIdIssuer: 'https://login.microsoftonline.com/{AZURE_AD_TENANT_ID}/v2.0',
								clientIdSettingName: 'AZURE_AD_CLIENT_ID',
								clientSecretSettingName: 'AZURE_AD_CLIENT_SECRET'
							}
						}
					}
				},
				platform: {
					apiRuntime: 'node:20'
				},
				globalHeaders: {
					'X-Content-Type-Options': 'nosniff',
					'X-Frame-Options': 'DENY',
					'X-XSS-Protection': '1; mode=block',
					'Referrer-Policy': 'strict-origin-when-cross-origin'
				}
			}
		})
	}
};

export default config;
