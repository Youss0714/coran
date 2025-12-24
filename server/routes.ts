import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.versets.list.path, async (req, res) => {
    try {
      const versets = await storage.getAllVersets();
      // If DB is empty, try to load from public JSON to seed it or just return JSON content
      if (versets.length === 0) {
        const fs = await import('fs/promises');
        const path = await import('path');
        const data = await fs.readFile(path.join(process.cwd(), 'client', 'public', 'quran.json'), 'utf-8');
        return res.json(JSON.parse(data));
      }
      res.json(versets);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
