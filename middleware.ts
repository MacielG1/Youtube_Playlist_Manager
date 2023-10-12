import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_URL!,
  token: process.env.UPSTASH_TOKEN!,
});

// Create a short range limiter for 5 requests per minute
const shortRangeLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(50, "5 m"),
  prefix: "ratelimit:short",
});

// Create a long range limiter for 100 requests per day
const longRangeLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(200, "1 d"),
  prefix: "ratelimit:long",
});

export default async function middleware(request: NextRequest, event: NextFetchEvent): Promise<Response | undefined> {
  const ip = request.ip ?? "127.0.0.1";

  // Check both limiters for the same identifier
  const shortRangeResult = await shortRangeLimiter.limit(ip);
  const longRangeResult = await longRangeLimiter.limit(ip);

  // If either of the limiters is exceeded, return a redirect response
  if (!shortRangeResult.success || !longRangeResult.success) {
    // return NextResponse.redirect(new URL("/blocked", request.url), { status: 429 });
    return new NextResponse("Error", { status: 429 });
  }
  //   console.log(`Short range attempts left: ${shortRangeResult.remaining}`);
  //   console.log(`Long range attempts left: ${longRangeResult.remaining}`);
  // Otherwise, proceed with the request
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
