import NextAuth from 'next-auth'

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    {
      id: 'osm-teams',
      name: 'OSM Teams',
      type: 'oauth',
      wellKnown:
        'https://auth.mapping.team/hyauth/.well-known/openid-configuration',
      authorization: { params: { scope: 'openid offline' } },
      idToken: true,
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.preferred_username,
          image: profile.picture,
        }
      },
      clientId: process.env.OSM_TEAMS_CLIENT_ID,
      clientSecret: process.env.OSM_TEAMS_CLIENT_SECRET,
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
        token.userId = profile.sub
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken
      session.user_id = token.userId
      return session
    },
  },
  // A database is optional, but required to persist accounts in a database
  database: process.env.DATABASE_URL,
})
