import { gemini } from "../utils/google";
import { embed } from "ai";

export async function generateEmbedding(content: string) {
  const result = await embed({
    model: gemini.embedding("text-embedding-004"),
    value: content,
  });

  return result.embedding;
}
