import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const versets = pgTable("versets", {
  id: serial("id").primaryKey(),
  sourate: integer("sourate").notNull(),
  verset: integer("verset").notNull(),
  texte: text("texte").notNull(),
});

export const insertVersetSchema = createInsertSchema(versets).omit({ id: true });

export type Verset = typeof versets.$inferSelect;
export type InsertVerset = z.infer<typeof insertVersetSchema>;

// Schema for client-side JSON validation
export const versetJsonSchema = z.object({
  sourate: z.number(),
  verset: z.number(),
  texte: z.string(),
});
export type VersetJson = z.infer<typeof versetJsonSchema>;
