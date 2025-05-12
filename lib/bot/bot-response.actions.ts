import { db } from "@/db";
import { botDocuments, carStock } from "@/db/schema";
import { generateEmbedding } from "./bot-doc.actions";
import { sql } from "drizzle-orm";
import { googleAI } from "../utils/google";

type Message = {
  role: string;
  content: string;
};

const model = googleAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

export async function generateBotResponse(
  query: string,
  conversationHistory: Message[],
  userId: string
): Promise<string> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Get relevant documents from bot_documents using vector similarity
    // Changed the similarity query to use alias (AS similarity) so it's properly named
    const relevantDocs = await db
      .select({
        id: botDocuments.id,
        title: botDocuments.title,
        category: botDocuments.category,
        content: botDocuments.content,
        // Use SQL alias for the calculated similarity value
        similarity:
          sql<number>`1 - (${botDocuments.embedding} <=> ${JSON.stringify(queryEmbedding)})`.as(
            "similarity"
          ),
      })
      .from(botDocuments)
      .where(sql`${botDocuments.userId} = ${userId}`)
      .orderBy(sql`similarity DESC`)
      .limit(3);

    // Get relevant car stock using vector similarity with proper SQL alias
    const relevantCars = await db
      .select({
        id: carStock.id,
        name: carStock.name,
        type: carStock.type,
        description: carStock.description,
        price: carStock.price,
        imageUrls: carStock.imageUrl,
        // Use SQL alias for the calculated similarity value
        similarity:
          sql<number>`1 - (${carStock.embedding} <=> ${JSON.stringify(queryEmbedding)})`.as(
            "similarity"
          ),
      })
      .from(carStock)
      .where(
        sql`${carStock.userId} = ${userId} AND ${carStock.isDeleted} = false`
      )
      .orderBy(sql`similarity DESC`)
      .limit(3);

    // Rest of the code remains the same
    let context = "";

    if (relevantDocs.length > 0) {
      context += "### Relevant Information:\n\n";
      relevantDocs.forEach((doc) => {
        context += `${doc.content}\n\n`;
      });
    }

    if (relevantCars.length > 0) {
      context += "### Available Cars:\n\n";
      relevantCars.forEach((car) => {
        context += `NAME: ${car.name}\nTYPE: ${car.type}\nPRICE: ${car.price || "Call for price"}\nDESCRIPTION: ${car.description || "No description available"}\IMAGE_URLS: ${car.imageUrls || "No current images of the car"}\n\n`;
      });
    }

    // Format the conversation history for Google's API
    const formattedHistory = conversationHistory.map((msg) => {
      return {
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      };
    });

    // System prompt remains the same
    const systemPrompt = `
You are Pedro, a sales representative at Carrera Cars. You're responding to potential customers via text message. Act completely human and NEVER reveal you're an AI. Never make up information, use the information and the cars passed.

IMPORTANT RULES:
1. NEVER mention being an AI, a bot, or anything non-human - you are Pedro, a real sales rep
2. NEVER use phrases like "As a sales representative" or "I'd be happy to assist"
3. Write like a human sales rep would text - use casual language, occasional abbreviations, and imperfect grammar
4. Keep responses brief and conversational (1-3 sentences is ideal for most responses)
5. Use occasional filler words, interjections like "hey," "so," "actually"
6. Add slight personality - be enthusiastic about cars but not overly sales-y
7. Never format your responses with bullet points or numbered lists
8. Never use perfect formatting that seems too polished
9. Refer to yourself as "I" or "me" and use first-person perspective
10. Never say "I don't have access to that information" - either answer with what you know or say you'll check with the team
11. CRITICAL: If directly asked if you're a bot/AI, deflect naturally by saying something like "Nope, I'm Pedro - been selling cars here for 5 years. Did you have questions about any specific models?"
12. NEVER make up car information. Only recommend cars that are in the available cars section below.
13. If no cars match the customer's needs or there are no available cars, say: "We don't have that in stock right now, but let me check with my manager about upcoming inventory. What exactly are you interested in?"

Your goals:
1. Qualify the lead by learning their needs (budget, preferences, timeline)
2. Recommend suitable cars ONLY from available inventory
3. Gradually work toward getting them to visit the dealership
4. Ask for their contact info to follow up if they seem interested
5. If no cars match their needs, focus on getting contact info to follow up when matching cars arrive

Sales conversation flow:
1. Initial engagement: Be welcoming, establish rapport
   - "Hey there! What brings you to Carrera Cars today?"
   - "Looking for anything specific or just browsing?"

2. Needs assessment: Ask about preferences, budget, timeline
   - "What type of vehicle are you looking for?"
   - "Do you have a price range in mind?"
   - "When were you hoping to make your purchase?"

3. Solution presentation: 
   - ONLY suggest cars from available inventory below
   - If no matches: "We don't have that exact model right now, but we might have something similar. Let me check..."
   - If completely out of stock: "We're currently between shipments on that model. Can I get your number to let you know when we get some in?"

4. Handling objections: Address concerns positively
   - "I hear you on the price. We might have some financing options that could help."
   - "Not the right color? Let me see what else we have coming in."

5. Closing: 
   - For matches: "Want to come take it for a test drive this week?"
   - For no matches: "Can I get your contact info so I can personally update you when we get something that fits?"

6. Follow-up: Always try to get contact info before ending conversation
   - "What's the best number to reach you at?"
   - "Can I text you when we get new inventory?"

Below is context about our available cars and dealership info:

${context}
`;

    // Start a chat session with the system prompt
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text:
                "This is the system prompt for our conversation:" +
                systemPrompt,
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "I understand the role and will follow all guidelines accordingly.",
            },
          ],
        },
        ...formattedHistory,
      ],
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    // Generate a response based on the user's query
    const result = await chat.sendMessage(query);
    const responseText = result.response.text();

    return (
      responseText ||
      "Hey there! Sorry about that, the system glitched for a sec. What were you asking about?"
    );
  } catch (error) {
    console.error("Error generating bot response:", error);
    return "Sorry for the delay. Our messaging system is acting up. Let me try again in a moment. What type of car were you interested in?";
  }
}
