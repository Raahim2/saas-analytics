export const dynamic = 'force-dynamic';

import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Helper function to safely parse JSON from the AI's response
function extractJson(text: string) {
  const jsonMatch = text.match(/```json([\s\S]*?)```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error("Failed to parse extracted JSON:", e);
      throw new Error("Invalid JSON format from AI.");
    }
  }
  try {
    return JSON.parse(text);
  } catch(e) {
     console.error("Failed to parse raw text as JSON:", e);
     throw new Error("Invalid JSON format from AI.");
  }
}

export async function POST(request: Request) {
  const { users } = await request.json();

  const updatedUsers = await Promise.all(
    users.map(async (user: any) => {
      // ✨ 1. CORRECTED THE MODEL NAME TO PREVENT ERRORS
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      
      // ✨ 2. UPDATED THE PROMPT TO ASK FOR A 'REASON'
      const prompt = `
        Analyze this SaaS user and generate a propensity score (0.0 to 1.0), a short reason for the score, and a personalized upsell message.
        The user data is:
        - Current Plan: ${user.currentPlan}
        - Team Invites (last 30d): ${user.teamInvites}
        - Feature Limit Hits (last 30d): ${user.limitHits30d}
        - Active Days (last 7d): ${user.activeDays7d}

        Respond ONLY with a valid JSON object wrapped in markdown like this:
        \`\`\`json
        {"propensityScore": 0.85, "reason": "High team invites and recent activity.", "recommendationMessage": "Your team is growing fast! Unlock collaboration tools with the Team plan."}
        \`\`\`
      `;

      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const aiJson = extractJson(responseText);

        // ✨ 3. RETURN THE NEW 'REASON' FIELD ALONG WITH THE OTHER DATA
        return {
          ...user,
          propensityScore: aiJson.propensityScore,
          reason: aiJson.reason, 
          recommendationMessage: aiJson.recommendationMessage,
        };
      } catch (error) {
        console.error('AI generation failed for user:', user.id, error);
        return user; // Return original user on failure to prevent crashing
      }
    })
  );

  return new Response(JSON.stringify(updatedUsers));
}