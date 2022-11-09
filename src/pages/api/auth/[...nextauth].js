import NextAuth from 'next-auth'

export const authOptions = {
  providers: [
    {
      id: 'openstreetmap',
      name: 'openstreetmap',
      clientId: process.env.OSM_CONSUMER_KEY,
      clientSecret: process.env.OSM_CONSUMER_SECRET,
      type: 'oauth',
      authorization: {
        url: 'https://www.openstreetmap.org/oauth2/authorize',
        params: {
          scope: 'read_prefs',
        },
      },
      token: 'https://www.openstreetmap.org/oauth2/token',
      userinfo: 'https://api.openstreetmap.org/api/0.6/user/details.json',
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
    error: '/auth/error',
  },
}

export default NextAuth(authOptions)
