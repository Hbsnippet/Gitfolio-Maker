import { NextResponse } from "next/server";

function publicDemoUrl(value: string | null) {
  if (!value) return null;

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.username || url.password) return null;

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "0.0.0.0" ||
    host === "::1"
  ) {
    return null;
  }

  if (
    /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
    /^\[?f[cd][0-9a-f]{2}:/i.test(host) ||
    /^\[?fe80:/i.test(host)
  ) {
    return null;
  }

  return url;
}

function allowsEmbedding(response: Response) {
  const frameOptions = response.headers.get("x-frame-options")?.toLowerCase();

  if (
    frameOptions?.includes("deny") ||
    frameOptions?.includes("sameorigin") ||
    frameOptions?.includes("allow-from")
  ) {
    return false;
  }

  const csp = response.headers.get("content-security-policy") ?? "";
  const ancestors = csp
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.toLowerCase().startsWith("frame-ancestors"));

  if (!ancestors) return true;

  const sources = ancestors.toLowerCase().split(/\s+/).slice(1);

  return sources.includes("*");
}

export async function GET(request: Request) {
  const rawUrl = new URL(request.url).searchParams.get("url");
  const demoUrl = publicDemoUrl(rawUrl);

  if (!demoUrl) {
    return NextResponse.json({ embeddable: false }, { status: 400 });
  }

  try {
    const response = await fetch(demoUrl, {
      method: "GET",
      redirect: "follow",
      headers: { Accept: "text/html" },
      signal: AbortSignal.timeout(8000),
      cache: "force-cache",
    });
    const finalUrl = publicDemoUrl(response.url);

    await response.body?.cancel();

    if (!finalUrl) {
      return NextResponse.json(
        { embeddable: false },
        { headers: { "Cache-Control": "public, max-age=300" } }
      );
    }

    return NextResponse.json(
      { embeddable: allowsEmbedding(response) },
      { headers: { "Cache-Control": "public, max-age=3600" } }
    );
  } catch {
    return NextResponse.json(
      { embeddable: false },
      { headers: { "Cache-Control": "public, max-age=300" } }
    );
  }
}
