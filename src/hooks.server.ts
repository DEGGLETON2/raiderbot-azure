/**
 * SvelteKit Server Hooks for RaiderBot Azure
 * Handles Azure AD authentication via @auth/sveltekit
 */

import { SvelteKitAuth } from '@auth/sveltekit';
import MicrosoftEntraID from '@auth/sveltekit/providers/microsoft-entra-id';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// Azure AD authentication handler
const { handle: authHandle } = SvelteKitAuth({
  providers: [
    MicrosoftEntraID({
      clientId: env.AZURE_AD_CLIENT_ID || '',
      clientSecret: env.AZURE_AD_CLIENT_SECRET || '',
      issuer: `https://login.microsoftonline.com/${env.AZURE_AD_TENANT_ID || ''}/v2.0`,
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
    }),
  ],
  secret: env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.email = profile.email;
        token.name = profile.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          email: token.email as string,
          name: token.name as string,
        };
      }
      return session;
    },
  },
});

// Public paths that don't require authentication
const publicPaths = [
  '/auth',
  '/api/auth',
  '/login',
  '/_app',
  '/favicon.ico',
  '/raider-logo.svg',
];

// Protected routes handler
const protectedRoutes: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;
  
  // Check if path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  if (isPublicPath) {
    return resolve(event);
  }
  
  // For Azure Static Web Apps, check the x-ms-client-principal header
  const clientPrincipal = event.request.headers.get('x-ms-client-principal');
  
  if (clientPrincipal) {
    // User is authenticated via Azure Static Web Apps
    try {
      const decoded = atob(clientPrincipal);
      const principal = JSON.parse(decoded);
      event.locals.user = {
        id: principal.userId,
        email: principal.userDetails,
        name: principal.userDetails,
        roles: principal.userRoles || [],
      };
    } catch {
      // Invalid principal, continue to check session
    }
  }
  
  // Check @auth/sveltekit session
  const session = await event.locals.auth?.();
  
  if (session?.user) {
    event.locals.user = {
      id: session.user.email || '',
      email: session.user.email || '',
      name: session.user.name || '',
      roles: ['authenticated'],
    };
  }
  
  // If no authentication and not in development, redirect to login
  const isDevelopment = env.NODE_ENV === 'development';
  
  if (!event.locals.user && !isDevelopment) {
    // For API routes, return 401
    if (pathname.startsWith('/svc/')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // For page routes, redirect to Azure AD login
    throw redirect(302, '/auth/signin');
  }
  
  return resolve(event);
};

// Export the combined handle
export const handle = sequence(authHandle, protectedRoutes);
