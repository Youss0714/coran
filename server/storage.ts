import { versets, type InsertVerset, type Verset } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getAllVersets(): Promise<Verset[]>;
  createVerset(verset: InsertVerset): Promise<Verset>;
}

export class DatabaseStorage implements IStorage {
  async getAllVersets(): Promise<Verset[]> {
    return await db.select().from(versets);
  }

  async createVerset(insertVerset: InsertVerset): Promise<Verset> {
    const [verset] = await db
      .insert(versets)
      .values(insertVerset)
      .returning();
    return verset;
  }
}

export const storage = new DatabaseStorage();
