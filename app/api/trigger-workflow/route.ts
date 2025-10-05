// In: app/api/trigger-workflow/route.ts

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Get the user data from the incoming request
    const userData = await request.json();

    // ✨ ADD THIS LOG: Check what data we received from the frontend
    console.log("Data received from dashboard:", userData);

    // 2. Get your secret n8n URL from environment variables
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

    if (!N8N_WEBHOOK_URL) {
      throw new Error("n8n webhook URL is not configured.");
    }

    // 3. Securely call the n8n webhook from the server
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData), // Forward the received data
    });

    if (!response.ok) {
        console.error("n8n server returned an error:", response.status, response.statusText);
        throw new Error("n8n server returned a non-200 response.");
    }

    // 4. Send a success response back to your dashboard
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("Error in trigger-workflow API:", error);
    return new Response(JSON.stringify({ success: false, error: "Failed to trigger workflow." }), { status: 500 });
  }
}