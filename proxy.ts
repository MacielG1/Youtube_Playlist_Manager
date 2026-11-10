import { NextRequest, NextResponse } from "next/server";
import { ipAddress } from "@vercel/functions";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const isDev = process.env.NODE_ENV === "development";

let shortRangeLimiter: Ratelimit | null = null;
let longRangeLimiter: Ratelimit | null = null;
let limitersInitialized = false;

function getLimiters(): { shortRangeLimiter: Ratelimit; longRangeLimiter: Ratelimit } | null {
  if (limitersInitialized) {
    return shortRangeLimiter && longRangeLimiter ? { shortRangeLimiter, longRangeLimiter } : null;
  }
  limitersInitialized = true;

  const url = process.env.UPSTASH_URL;
  const token = process.env.UPSTASH_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({
    url,
    token,
  });

  // Create a short range limiter for 70 requests per 10 minutes
  shortRangeLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.fixedWindow(70, "10 m"),
    prefix: "ratelimit:short",
  });

  // Create a long range limiter for 300 requests per day
  longRangeLimiter = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.fixedWindow(300, "1 d"),
    prefix: "ratelimit:long",
  });

  return { shortRangeLimiter, longRangeLimiter };
}

function retryAfterFromReset(reset: number | undefined): string {
  if (typeof reset !== "number" || !Number.isFinite(reset)) return "10";
  return String(Math.max(1, Math.ceil((reset - Date.now()) / 1000)));
}

export default async function middleware(request: NextRequest): Promise<Response | undefined> {
  if (isDev) return NextResponse.next();

  const ip = ipAddress(request) ?? "127.0.0.1";

  try {
    const limiters = getLimiters();
    if (!limiters) {
      return new NextResponse("Service Unavailable", { status: 503 });
    }
    // Check both limiters for the same identifier
    const shortRangeResult = await limiters.shortRangeLimiter.limit(ip);
    if (!shortRangeResult.success) {
      return new NextResponse("Error", { status: 429, headers: { "Retry-After": retryAfterFromReset(shortRangeResult.reset) } });
    }

    const longRangeResult = await limiters.longRangeLimiter.limit(ip);

    // console.log(`Short range attempts left: ${shortRangeResult.remaining}`);
    // console.log(`Long range attempts left: ${longRangeResult.remaining}`);

    // If either of the limiters is exceeded, return a redirect response
    if (!longRangeResult.success) {
      return new NextResponse("Error", { status: 429, headers: { "Retry-After": retryAfterFromReset(longRangeResult.reset) } });
    }

    // Otherwise, proceed with the request
    return NextResponse.next();
  } catch {
    return new NextResponse("Service Unavailable", { status: 503, headers: { "Retry-After": "10" } });
  }
}

export const config = {
  matcher: "/api/:path*",
};
