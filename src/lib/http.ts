import "server-only";

/**
 * Požadavek smí přijít jen z tohoto webu. Prohlížeč posílá Origin u každého
 * POST a PUT, takže chybějící hlavička znamená požadavek mimo prohlížeč.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = new Set([new URL(request.url).origin]);
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).origin);
  }
  return allowed.has(origin);
}

export function tooManyRequests(retryAfter: number) {
  return Response.json(
    { error: "rate_limited" },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
