import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname.toLowerCase();
  
  // Eternal thorn redirect strategy: ANY path beginning with /elevenlabs
  // e.g., /elevenlabs, /elevenlabs-scam, /elevenlabs-pricing, /elevenlabs999
  if (pathname.startsWith('/elevenlabs')) {
    // Preserve the original query parameters
    const searchParams = url.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : '';
    
    // Add a ref parameter to track the source of the redirect
    const newSearchParams = new URLSearchParams(searchParams);
    if (!newSearchParams.has('ref')) {
      newSearchParams.set('ref', pathname.replace('/', ''));
    }
    
    // Redirect to homepage with preserved and enhanced query params
    const newUrl = new URL('/', request.url);
    newUrl.search = newSearchParams.toString();
    
    return NextResponse.redirect(newUrl, 308); // Permanent redirect
  }
  
  // For all other paths, continue as normal
  return NextResponse.next();
}