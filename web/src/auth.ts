import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  basePath: '/air/api/auth',
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/air/login',
  },
  // Explicit cookie config for HTTP (Docker / localhost without TLS)
  cookies: {
    pkceCodeVerifier: {
      name: 'authjs.pkce.code_verifier',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
    },
    state: {
      name: 'authjs.state',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
    },
    callbackUrl: {
      name: 'authjs.callback-url',
      options: { sameSite: 'lax', path: '/', secure: false },
    },
    sessionToken: {
      name: 'authjs.session-token',
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
    },
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
});
