import NextAuth from 'next-auth'

export const authOptions = {
  debug: true,
  providers: [
    {
      id: 'openstreetmap',
      name: 'openstreetmap',
      clientId: 'osm-teams',
      clientSecret: 'osm-teams-secret',
      type: 'oauth',
      authorization: 'http://localhost:4444/oauth2/auth',
      token: 'http://localhost:4444/oauth2/token',
      profile({ user }) {
        return {
          id: user?.id,
          name: user?.display_name,
          image: user?.img?.href,
        }
      },
    },
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error', // Error code passed in query string as ?error=
  },
}

export default NextAuth(authOptions)
