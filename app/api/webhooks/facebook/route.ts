import { NextResponse } from "next/server";
import { db } from "@/db";
import { webhookLogs } from "@/db/schema";
import { processFacebookLead } from "@/lib/facebook/lead-processing";

export async function GET(request: Request) {
  // Log all request information
  console.log("Webhook GET request received", request.url);

  const { searchParams } = new URL(request.url);

  // Log all query parameters
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  console.log("Query parameters:", JSON.stringify(params, null, 2));

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Log specific parameters
  console.log("Mode:", mode);
  console.log("Token:", token);
  console.log("Challenge:", challenge);

  // Log environment variable for comparison
  console.log("Expected token:", process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN);

  // Facebook webhook verification
  const verifyToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;

  // Log token comparison
  console.log("Tokens match:", token === verifyToken);

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Verification successful, returning challenge");
    return new Response(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  console.log("Verification failed");
  return new Response("Verification failed", {
    status: 403,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Log the webhook event
    await db.insert(webhookLogs).values({
      eventType: "facebook_lead",
      payload: JSON.stringify(body),
      status: "received",
    });

    // Check if it's a lead event
    if (body.object === "page" && body.entry) {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === "leadgen" && change.value) {
            // Process the lead
            console.log(change.value);
            await processFacebookLead(change.value);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);

    // Log the error
    if (request.body) {
      const bodyText = await request.text();
      await db.insert(webhookLogs).values({
        eventType: "facebook_lead_error",
        payload: bodyText,
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
