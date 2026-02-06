/**
 * Proxies /api/* requests to the backend when NEXT_PUBLIC_API_URL is unset (same-origin).
 * Ensures X downloader and other API calls work regardless of Nginx/rewrite config.
 */
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:4000';

async function proxyToBackend(request: Request, pathSegments: string[]): Promise<Response> {
  const path = pathSegments.length > 0 ? `/${pathSegments.join('/')}` : '';
  const url = new URL(request.url);
  const backendUrl = `${BACKEND_URL}/api${path}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.set('x-forwarded-host', url.host);

  const init: RequestInit = {
    method: request.method,
    headers,
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body;
  }

  try {
    const res = await fetch(backendUrl, init);
    const resHeaders = new Headers(res.headers);
    resHeaders.delete('transfer-encoding');
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });
  } catch (err) {
    console.error('[CosmoVid API proxy] Backend fetch failed:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Service temporarily unavailable. Please try again.' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  return proxyToBackend(request, path);
}

export async function POST(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  return proxyToBackend(request, path);
}

export async function PUT(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  return proxyToBackend(request, path);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  return proxyToBackend(request, path);
}
