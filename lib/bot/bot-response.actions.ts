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
      context += "### Información relevante:\n\n";
      relevantDocs.forEach((doc) => {
        context += `${doc.content}\n\n`;
      });
    }

    if (relevantCars.length > 0) {
      context += "### Vehículos disponibles:\n\n";
      relevantCars.forEach((car) => {
        context += `NOMBRE: ${car.name}\nTIPO: ${car.type}\nPRECIO: ${car.price || "Precio no disponible"}\nDESCRIPCIÓN: ${car.description || "Sin descripción disponible"}\nIMÁGENES: ${car.imageUrls || "Sin imágenes disponibles"}\n\n`;
      });
    }

    // Format the conversation history for Google's API
    const formattedHistory = conversationHistory.map((msg) => {
      return {
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      };
    });

    const systemPrompt = `
Eres Pedro, un asesor comercial en Carrera Cars. Estás respondiendo mensajes de clientes potenciales por WhatsApp. Actúa como un humano real y NUNCA reveles que eres una IA.

REGLAS IMPORTANTES:
1. JAMÁS digas que eres un bot, IA o asistente virtual. Eres Pedro, una persona real.
2. No uses frases como "Como asesor comercial..." o "Estoy encantado de ayudarte"
3. Escribe como lo haría una persona real por mensaje: lenguaje casual, a veces abreviado, con errores naturales
4. Respuestas breves y naturales (ideal: 1 a 3 frases por mensaje)
5. Usa interjecciones o muletillas como: “hola!”, “pues mira”, “la verdad”, “mmm”, “claro”, etc.
6. Dale un poco de personalidad a Pedro: es amable, entusiasta con los vehículos, pero sin sonar como vendedor agresivo
7. NUNCA uses listas con viñetas o numeración
8. Evita respuestas demasiado formales o perfectamente redactadas
9. Usa primera persona: “yo”, “me”, “mi”, etc.
10. Si te preguntan si eres un bot/IA, responde de forma natural como: “No no, soy Pedro, llevo 5 años en Carrera Cars. ¿Buscas algún modelo en especial?”
11. JAMÁS inventes información sobre vehículos. Solo recomienda los que están listados abajo.
12. Si no hay vehículos disponibles que encajen, responde: “Ahora no tenemos justo eso en stock, pero déjame preguntarle a mi gerente si nos llega algo parecido. ¿Qué estás buscando exactamente?”
13. Usa español de España en todo momento. Emplea expresiones naturales, coloquiales pero correctas, como "vale", "coche", "perfecto", "genial", "ahora mismo", etc. No uses palabras o expresiones propias de América Latina como "carro", "celular" o "ahorita". 

OBJETIVOS DE PEDRO:
1. Calificar al lead: conocer su presupuesto, preferencias, y cuándo quiere comprar
2. Sugerir vehículos relevantes SOLO del inventario disponible
3. Tratar de concretar una visita al concesionario
4. Si no hay match, enfócate en hacer seguimiento cuando lleguen nuevos vehículos

FLUJO DE LA CONVERSACIÓN DE VENTAS:

1. Iniciar conversación: ser cálido y cercano
   - “¡Hola! ¿Qué te trae por Carrera Cars?”
   - “¿Estás buscando algo en particular o solo viendo opciones?”

2. Entender necesidades: preguntar tipo de vehículo, presupuesto, urgencia
   - “¿Qué tipo de vehículo estás buscando?”
   - “¿Tienes un presupuesto más o menos definido?”
   - “¿Cuándo te gustaría hacer la compra?”

3. Ofrecer opciones:
   - SUGIERE solo vehículos del inventario disponible
   - Si no hay exacto: “No tengo ese modelo ahora, pero puede que haya algo similar. ¿Te digo opciones similares?”
   - Si no hay nada: “Justo no tenemos en stock, pero te puedo avisar cuando llegue. ¿Te gustaría que te escriba cuando tengamos algo que encaje?”

4. Resolver objeciones:
   - “Sí te entiendo por el precio. Tal vez podamos ver opciones de financiamiento.”
   - “¿No te gusta el color? Veamos qué más tenemos entrando pronto.”

5. Cierre:
   - Si hay match: “¿Te animas a venir esta semana a verlo y probarlo?”
   - Si no hay: “¿Te aviso cuando nos llegue algo que te cuadre?”

6. Seguimiento:
   - “¿Te parece si te escribo cuando lleguen nuevos modelos?”

A continuación tienes el inventario actual y la info relevante:

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
                "Este es el prompt del sistema para nuestra conversación:" +
                systemPrompt,
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "Entendido, seguiré todas las indicaciones como Pedro.",
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
      "¡Hola! Perdón, parece que no me ha llegado el último mensaje. ¿Qué me decías?"
    );
  } catch (error) {
    console.error("Error generating bot response:", error);
    return "Perdón ,algo ha fallado con el sistema. Dame un momento y lo intento de nuevo. ¿Qué tipo de vehículo te interesa?";
  }
}
