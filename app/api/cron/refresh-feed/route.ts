import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getCachedPageData } from "@app/lib/resolvePageData";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  
  // Secure the cron endpoint in production using the CRON_SECRET token if configured
  if (
    process.env.NODE_ENV === "production" &&
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    console.log("[Cron] Purging homepage-news cache tag...");
    
    // 1. Purge the filesystem page cache
    revalidateTag("homepage-news");
    
    // 2. Warm up the cache immediately by fetching and classifying
    console.log("[Cron] Warming cache with fresh news and AI classifications...");
    const freshData = await getCachedPageData();
    
    console.log("[Cron] Background cache refresh completed successfully.");
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      isEmpty: freshData.isEmpty,
    });
  } catch (error) {
    console.error("[Cron] Cache refresh failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
