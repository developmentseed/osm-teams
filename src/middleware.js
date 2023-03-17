export { default } from 'next-auth/middleware'

export const config = {
  matcher: ['/clients', '/organizations/:path*', '/dashboard'],
}
