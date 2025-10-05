// In: app/api/discover-insights/route.ts

export const dynamic = 'force-dynamic'; // ✨ THIS IS THE FIX

import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  const { users } = await request.json();

  const upgradedUsers = users.filter((u: any) => u.upgradedIn30d);
  const nonUpgradedUsers = users.filter((u: any) => !u.upgradedIn30d);

  const prompt = `
    You are a world-class Product Analyst. I have two groups of SaaS users.
    GROUP A (Upgraded): ${JSON.stringify(upgradedUsers.slice(0, 10))}
    GROUP B (Did Not Upgrade): ${JSON.stringify(nonUpgradedUsers.slice(0, 10))}

    Analyze their behaviors. What is the single biggest difference or pattern in GROUP A that is not in GROUP B?
    Describe this insight in one single sentence, like you're telling a CEO.
    For example: "Users who invite more than 4 teammates are far more likely to upgrade."
  `;

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  const result = await model.generateContent(prompt);
  const insightText = result.response.text();

  return new Response(JSON.stringify({ insight: insightText }));
}