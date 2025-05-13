import { NextResponse } from "next/server";
import { db } from "@/db";
import { webhookLogs } from "@/db/schema";
import { processFacebookLead } from "@/lib/facebook/lead-processing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Facebook webhook verification
  const verifyToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Facebook webhook verified");
    return new Response(challenge, { status: 200 });
  }

  return new Response("Verification failed", { status: 403 });
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
