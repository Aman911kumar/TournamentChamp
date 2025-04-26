import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertTransactionSchema, 
  insertRegistrationSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API Routes
  // Games
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getGames();
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });
  
  app.get("/api/games/:id", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.getGame(gameId);
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });
  
  // Tournaments
  app.get("/api/tournaments", async (req, res) => {
    try {
      const gameId = req.query.gameId ? parseInt(req.query.gameId as string) : undefined;
      const status = req.query.status as string | undefined;
      
      let tournaments;
      
      if (gameId) {
        tournaments = await storage.getTournamentsByGame(gameId);
      } else if (status === "featured") {
        tournaments = await storage.getFeaturedTournaments();
      } else if (status === "upcoming") {
        tournaments = await storage.getUpcomingTournaments();
      } else if (status === "live") {
        tournaments = await storage.getLiveTournaments();
      } else if (status === "completed") {
        tournaments = await storage.getCompletedTournaments();
      } else if (status === "free") {
        tournaments = await storage.getFreeTournaments();
      } else {
        tournaments = await storage.getTournaments();
      }
      
      res.json(tournaments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tournaments" });
    }
  });
  
  app.get("/api/tournaments/:id", async (req, res) => {
    try {
      const tournamentId = parseInt(req.params.id);
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tournament" });
    }
  });
  
  // Protected tournament routes
  app.post("/api/tournaments/:id/register", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const tournamentId = parseInt(req.params.id);
      const userId = req.user!.id;
      
      // Check if tournament exists
      const tournament = await storage.getTournament(tournamentId);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      // Check if tournament is full
      if (tournament.currentPlayers >= tournament.maxPlayers) {
        return res.status(400).json({ message: "Tournament is full" });
      }
      
      // Check if user already registered
      const existingRegistrations = await storage.getRegistrationsByTournament(tournamentId);
      const alreadyRegistered = existingRegistrations.some(reg => reg.userId === userId);
      if (alreadyRegistered) {
        return res.status(400).json({ message: "Already registered for this tournament" });
      }
      
      // Check if user has enough balance for entry fee
      if (tournament.entryFee > 0) {
        const user = await storage.getUser(userId);
        if (!user || user.balance < tournament.entryFee) {
          return res.status(400).json({ message: "Insufficient balance" });
        }
        
        // Create transaction for entry fee
        await storage.createTransaction({
          userId: userId,
          amount: -tournament.entryFee,
          type: "entry_fee",
          description: `Entry fee for ${tournament.title}`,
          tournamentId: tournamentId,
          status: "completed",
          metadata: null
        });
      }
      
      // Create registration
      const registrationData = insertRegistrationSchema.parse({
        userId: userId,
        tournamentId: tournamentId,
        status: "registered"
      });
      
      const registration = await storage.createRegistration(registrationData);
      res.status(201).json(registration);
    } catch (error) {
      res.status(500).json({ message: "Failed to register for tournament" });
    }
  });
  
  // Wallet & Transactions
  app.get("/api/transactions", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const transactions = await storage.getTransactionsByUser(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });
  
  app.post("/api/transactions/deposit", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const schema = z.object({
        amount: z.number().positive(),
        method: z.string()
      });
      
      const { amount, method } = schema.parse(req.body);
      const userId = req.user!.id;
      
      const transaction = await storage.createTransaction({
        userId: userId,
        amount: amount,
        type: "deposit",
        description: `Deposit via ${method}`,
        status: "completed",
        metadata: { method }
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to process deposit" });
    }
  });
  
  app.post("/api/transactions/withdraw", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const schema = z.object({
        amount: z.number().positive(),
        method: z.string()
      });
      
      const { amount, method } = schema.parse(req.body);
      const userId = req.user!.id;
      
      // Check if user has enough balance
      const user = await storage.getUser(userId);
      if (!user || user.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      const transaction = await storage.createTransaction({
        userId: userId,
        amount: -amount,
        type: "withdrawal",
        description: `Withdrawal to ${method}`,
        status: "completed",
        metadata: { method }
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });
  
  // User tournaments (registrations)
  app.get("/api/user/tournaments", async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const userId = req.user!.id;
      const registrations = await storage.getRegistrationsByUser(userId);
      
      // Get tournament details for each registration
      const tournamentPromises = registrations.map(async (registration) => {
        const tournament = await storage.getTournament(registration.tournamentId);
        return {
          ...registration,
          tournament
        };
      });
      
      const userTournaments = await Promise.all(tournamentPromises);
      res.json(userTournaments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user tournaments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
