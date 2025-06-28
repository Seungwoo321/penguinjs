import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
  localePrefix: 'always'
})

export const config = {
  matcher: [
    // Match all pathnames except for
    // - api routes
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - all root files inside public (e.g. /favicon.ico)
    '/((?!api|_next|_vercel|favicon.ico|robots.txt|sitemap.xml).*)',
    // Specifically match the root path
    '/'
  ]
}