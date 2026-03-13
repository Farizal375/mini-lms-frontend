/**
 * Clerk Webhook Endpoint (DEPRECATED)
 * 
 * This endpoint was used when the application was using Clerk authentication.
 * Since the application has migrated to JWT-based authentication through Express backend,
 * this webhook is no longer needed.
 * 
 * Keeping this file for reference, but returning 200 OK for any requests.
 */

export async function POST(req: Request) {
  // Return 200 OK to prevent errors if Clerk still tries to send webhooks
  return new Response(JSON.stringify({ success: true }), { 
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}