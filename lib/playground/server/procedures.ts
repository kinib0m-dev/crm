import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { botConversations, botMessages } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, and, desc } from "drizzle-orm";
import { generateEmbedding } from "@/lib/bot/bot-doc.actions";
import { generateBotResponse } from "@/lib/bot/bot-response.actions";

export const botChatRouter = createTRPCRouter({
  // Create a new conversation
  createConversation: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        const [newConversation] = await db
          .insert(botConversations)
          .values({
            userId,
            name: input.name,
          })
          .returning();

        // After creating the conversation, add an initial bot message
        const [initialMessage] = await db
          .insert(botMessages)
          .values({
            conversationId: newConversation.id,
            role: "assistant",
            content:
              "Hey there! This is Pedro from Carrera Cars. I've noticed you've filled out a form in one of our ads. What exactly are you interested in? ",
          })
          .returning();

        return {
          success: true,
          conversation: newConversation,
          initialMessage,
        };
      } catch (error) {
        console.error("Error creating conversation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create conversation",
        });
      }
    }),

  // List conversations
  listConversations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.userId as string;

      const conversations = await db
        .select()
        .from(botConversations)
        .where(eq(botConversations.userId, userId))
        .orderBy(desc(botConversations.updatedAt));

      return {
        success: true,
        conversations,
      };
    } catch (error) {
      console.error("Error listing conversations:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list conversations",
      });
    }
  }),

  // Get conversation by ID with messages
  getConversation: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        const conversation = await db
          .select()
          .from(botConversations)
          .where(
            and(
              eq(botConversations.id, input.id),
              eq(botConversations.userId, userId)
            )
          )
          .limit(1);

        if (!conversation[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversation not found",
          });
        }

        const messages = await db
          .select()
          .from(botMessages)
          .where(eq(botMessages.conversationId, input.id))
          .orderBy(desc(botMessages.createdAt));

        return {
          success: true,
          conversation: conversation[0],
          messages,
        };
      } catch (error) {
        console.error("Error getting conversation:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get conversation",
        });
      }
    }),

  // Add message to conversation and get bot response
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        // Verify the conversation exists and belongs to the user
        const conversationCheck = await db
          .select()
          .from(botConversations)
          .where(
            and(
              eq(botConversations.id, input.conversationId),
              eq(botConversations.userId, userId)
            )
          )
          .limit(1);

        if (!conversationCheck[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversation not found",
          });
        }

        // Get previous messages for context
        const previousMessages = await db
          .select()
          .from(botMessages)
          .where(eq(botMessages.conversationId, input.conversationId))
          .orderBy(desc(botMessages.createdAt))
          .limit(10);

        // Create message embedding for the user message
        try {
          const embedding = await generateEmbedding(input.content);

          // Store user message with embedding
          await db.insert(botMessages).values({
            conversationId: input.conversationId,
            role: "user",
            content: input.content,
            embedding,
          });
        } catch (embeddingError) {
          console.error(
            "Error generating embedding for user message:",
            embeddingError
          );

          // Still store the message even if embedding fails
          await db.insert(botMessages).values({
            conversationId: input.conversationId,
            role: "user",
            content: input.content,
          });
        }

        // Update conversation updatedAt
        await db
          .update(botConversations)
          .set({ updatedAt: new Date() })
          .where(eq(botConversations.id, input.conversationId));

        // Generate bot response using RAG
        const botResponse = await generateBotResponse(
          input.content,
          previousMessages.reverse().map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          userId
        );

        // Add a natural delay before "sending" the response
        // Calculate response time based on length (humans don't type instantly)
        const responseDelay = Math.min(
          Math.max(1000, botResponse.length * 20), // 20ms per character, minimum 1 second
          6000 // but no more than 6 seconds
        );

        // Add the delay before storing the response
        await new Promise((resolve) => setTimeout(resolve, responseDelay));

        // Store bot response
        const [assistantMessage] = await db
          .insert(botMessages)
          .values({
            conversationId: input.conversationId,
            role: "assistant",
            content: botResponse,
          })
          .returning();

        return {
          success: true,
          assistantMessage,
        };
      } catch (error) {
        console.error("Error sending message:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message",
        });
      }
    }),

  // Delete conversation
  deleteConversation: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        // Verify the conversation exists and belongs to the user
        const conversationCheck = await db
          .select()
          .from(botConversations)
          .where(
            and(
              eq(botConversations.id, input.id),
              eq(botConversations.userId, userId)
            )
          )
          .limit(1);

        if (!conversationCheck[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversation not found",
          });
        }

        // Delete all messages in the conversation
        await db
          .delete(botMessages)
          .where(eq(botMessages.conversationId, input.id));

        // Delete the conversation
        await db
          .delete(botConversations)
          .where(eq(botConversations.id, input.id));

        return {
          success: true,
          message: "Conversation deleted successfully",
        };
      } catch (error) {
        console.error("Error deleting conversation:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete conversation",
        });
      }
    }),
});
