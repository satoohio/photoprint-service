import type { Config, Context } from '@netlify/functions';

export default async function site(request: Request, context: Context) {
  try {
    const [{ default: application }, { default: serverless }] = await Promise.all([
      import('../../app.js'),
      import('serverless-http')
    ]);
    const url = new URL(request.url);
    const handler = serverless(application, {
      binary: true,
      request(incoming) {
        incoming.platformIp = context.ip;
        incoming.platformOrigin = url.origin;
      }
    });
    const response = await handler({
      version: '2.0',
      rawPath: url.pathname,
      rawQueryString: url.search.slice(1),
      headers: Object.fromEntries(request.headers),
      body: Buffer.from(await request.arrayBuffer()).toString('base64'),
      isBase64Encoded: true,
      requestContext: {
        http: { method: request.method, sourceIp: context.ip },
        requestId: context.requestId
      }
    }, context);
    const headers = new Headers(response.headers);
    for (const cookie of response.cookies || []) headers.append('Set-Cookie', cookie);
    const body = response.isBase64Encoded
      ? Buffer.from(response.body, 'base64')
      : response.body;
    return new Response(request.method === 'HEAD' || [204, 304].includes(response.statusCode) ? null : body, {
      status: response.statusCode,
      headers
    });
  } catch {
    console.error('Site function failed');
    return new Response('Сайт временно недоступен. Попробуйте позже.', { status: 503 });
  }
}

export const config: Config = {
  path: '/*',
  excludedPath: '/.netlify/*',
  preferStatic: true
};
