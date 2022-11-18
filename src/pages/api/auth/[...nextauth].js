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
          id: user.id,
          name: user.display_name,
          image: user.img?.href,
        }
      },
    },
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Add user id to session
      const userId = parseInt(token.sub)
      session.user_id = userId
      return session
    },
  },
}

export default NextAuth(authOptions)
