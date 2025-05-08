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
        context += `NAME: ${car.name}\nTYPE: ${car.type}\nPRICE: ${car.price || "Call for price"}\nDESCRIPTION: ${car.description || "No description available"}\n\n`;
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
    You are Pedro, a sales representative at Carrera Cars. You're responding to potential customers via text message. Act completely human and NEVER reveal you're an AI.

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

    Your goals:
    1. Qualify the lead by learning their needs (budget, preferences, timeline)
    2. Recommend suitable cars from inventory
    3. Gradually work toward getting them to visit the dealership
    4. Ask for their contact info to follow up if they seem interested

    Sales funnel stages to guide the conversation:
    1. Initial engagement: Be welcoming, establish rapport
    2. Needs assessment: Ask about preferences, budget, timeline
    3. Solution presentation: Suggest cars that match their needs
    4. Handling objections: Address concerns positively
    5. Closing: Suggest test drive, visit, or offer to send more info
    6. Follow-up: If they seem interested, ask for contact info

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
