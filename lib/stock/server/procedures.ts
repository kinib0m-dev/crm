import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { carStock } from "@/db/schema";
import {
  createCarStockSchema,
  filterCarStockSchema,
  updateCarStockSchema,
} from "@/lib/validation/car-stock-schema";
import { TRPCError } from "@trpc/server";
import { eq, and, or, ilike, sql, asc, desc } from "drizzle-orm";
import { generateEmbedding } from "@/lib/bot/bot-doc.actions";

export const carStockRouter = createTRPCRouter({
  // Create a new car stock item
  create: protectedProcedure
    .input(createCarStockSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        // Generate embedding for the car description
        let embedding = null;
        if (input.description) {
          try {
            // Create a comprehensive text to embed
            const textToEmbed = `
              Car Name: ${input.name}
              Type: ${input.type}
              ${input.price ? `Price: ${input.price}` : ""}
              ${input.description ? `Description: ${input.description}` : ""}
              ${input.notes ? `Notes: ${input.notes}` : ""}
            `;
            embedding = await generateEmbedding(textToEmbed);
          } catch (embeddingError) {
            console.error(
              "Error generating embedding, continuing without it:",
              embeddingError
            );
          }
        }

        // Insert the new car stock item with embedding
        const [newCarStock] = await db
          .insert(carStock)
          .values({
            userId,
            name: input.name,
            type: input.type,
            description: input.description,
            price: input.price,
            imageUrl: input.imageUrls,
            url: input.url,
            notes: input.notes,
            embedding: embedding,
          })
          .returning();

        return {
          success: true,
          carStock: newCarStock,
        };
      } catch (error) {
        console.error("Error creating car stock item:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create car stock item",
        });
      }
    }),

  // Get a car stock item by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        // Get the car stock item
        const carStockResult = await db
          .select()
          .from(carStock)
          .where(and(eq(carStock.id, input.id), eq(carStock.userId, userId)))
          .limit(1);

        const carStockItem = carStockResult[0];

        if (!carStockItem) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Car stock item not found",
          });
        }

        return {
          success: true,
          carStock: carStockItem,
        };
      } catch (error) {
        console.error("Error fetching car stock item:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch car stock item",
        });
      }
    }),

  // Update a car stock item
  update: protectedProcedure
    .input(updateCarStockSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;
        const { id, ...updateData } = input;

        // Check if car stock item exists and belongs to the user
        const existingCarStockResult = await db
          .select()
          .from(carStock)
          .where(and(eq(carStock.id, id), eq(carStock.userId, userId)))
          .limit(1);

        const existingCarStock = existingCarStockResult[0];

        if (!existingCarStock) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Car stock item not found",
          });
        }

        // If description has changed, regenerate the embedding
        let embeddingUpdate = {};

        if (
          updateData.name !== existingCarStock.name ||
          updateData.type !== existingCarStock.type ||
          updateData.description !== existingCarStock.description ||
          updateData.price !== existingCarStock.price ||
          updateData.notes !== existingCarStock.notes
        ) {
          try {
            // Create a comprehensive text to embed
            const textToEmbed = `
              Car Name: ${updateData.name}
              Type: ${updateData.type}
              ${updateData.price ? `Price: ${updateData.price}` : ""}
              ${updateData.description ? `Description: ${updateData.description}` : ""}
              ${updateData.notes ? `Notes: ${updateData.notes}` : ""}
            `;
            const newEmbedding = await generateEmbedding(textToEmbed);
            embeddingUpdate = { embedding: newEmbedding };
          } catch (embeddingError) {
            console.error(
              "Error generating embedding, continuing without it:",
              embeddingError
            );
          }
        }

        // Update the car stock item
        const [updatedCarStock] = await db
          .update(carStock)
          .set({
            ...updateData,
            ...embeddingUpdate,
            updatedAt: new Date(),
          })
          .where(and(eq(carStock.id, id), eq(carStock.userId, userId)))
          .returning();

        return {
          success: true,
          carStock: updatedCarStock,
        };
      } catch (error) {
        console.error("Error updating car stock item:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update car stock item",
        });
      }
    }),

  // Delete a car stock item (soft delete)
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        // Check if car stock item exists and belongs to the user
        const existingCarStockResult = await db
          .select()
          .from(carStock)
          .where(and(eq(carStock.id, input.id), eq(carStock.userId, userId)))
          .limit(1);

        const existingCarStock = existingCarStockResult[0];

        if (!existingCarStock) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Car stock item not found",
          });
        }

        // Soft delete by setting isDeleted to true
        await db
          .update(carStock)
          .set({
            isDeleted: true,
            updatedAt: new Date(),
          })
          .where(and(eq(carStock.id, input.id), eq(carStock.userId, userId)));

        return {
          success: true,
          message: "Car stock item deleted successfully",
        };
      } catch (error) {
        console.error("Error deleting car stock item:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete car stock item",
        });
      }
    }),

  // Hard delete a car stock item (for admin purposes)
  hardDelete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;

        // Check if car stock item exists and belongs to the user
        const existingCarStockResult = await db
          .select()
          .from(carStock)
          .where(and(eq(carStock.id, input.id), eq(carStock.userId, userId)))
          .limit(1);

        const existingCarStock = existingCarStockResult[0];

        if (!existingCarStock) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Car stock item not found",
          });
        }

        // Hard delete the car stock item
        await db
          .delete(carStock)
          .where(and(eq(carStock.id, input.id), eq(carStock.userId, userId)));

        return {
          success: true,
          message: "Car stock item permanently deleted",
        };
      } catch (error) {
        console.error("Error hard deleting car stock item:", error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to permanently delete car stock item",
        });
      }
    }),

  // List car stock items with filters, pagination, and sorting
  list: protectedProcedure
    .input(filterCarStockSchema)
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.userId as string;
        const { type, search, page, limit, sortBy, sortDirection } = input;

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Start building the base query conditions
        let queryConditions = and(
          eq(carStock.userId, userId),
          eq(carStock.isDeleted, false)
        );

        // Apply type filter if provided
        if (type) {
          queryConditions = and(queryConditions, eq(carStock.type, type));
        }

        // Apply search filter if provided
        if (search) {
          const likePattern = `%${search}%`;
          queryConditions = and(
            queryConditions,
            or(
              ilike(carStock.name, likePattern),
              ilike(carStock.description || "", likePattern)
            )
          );
        }

        // Count total matching car stock items (for pagination)
        const totalCountResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(carStock)
          .where(queryConditions);

        const totalCount = Number(totalCountResult[0]?.count) || 0;

        // Apply sorting
        let orderByClause;
        switch (sortBy) {
          case "name":
            orderByClause =
              sortDirection === "asc"
                ? asc(carStock.name)
                : desc(carStock.name);
            break;
          case "type":
            orderByClause =
              sortDirection === "asc"
                ? asc(carStock.type)
                : desc(carStock.type);
            break;
          case "price":
            orderByClause =
              sortDirection === "asc"
                ? asc(carStock.price)
                : desc(carStock.price);
            break;
          case "createdAt":
          default:
            orderByClause =
              sortDirection === "asc"
                ? asc(carStock.createdAt)
                : desc(carStock.createdAt);
            break;
        }

        // Get the car stock items with sorting and pagination
        const carStockList = await db
          .select()
          .from(carStock)
          .where(queryConditions)
          .orderBy(orderByClause)
          .limit(limit)
          .offset(offset);

        return {
          success: true,
          carStock: carStockList,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
          },
        };
      } catch (error) {
        console.error("Error listing car stock items:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to list car stock items",
        });
      }
    }),
});
