import { 
  users, type User, type InsertUser,
  games, type Game, type InsertGame,
  tournaments, type Tournament, type InsertTournament,
  registrations, type Registration, type InsertRegistration, 
  transactions, type Transaction, type InsertTransaction 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { pool } from "./db";
import { eq, desc, and, isNull } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, newBalance: number): Promise<User | undefined>;
  
  // Game operations
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  
  // Tournament operations
  getTournaments(): Promise<Tournament[]>;
  getTournament(id: number): Promise<Tournament | undefined>;
  getTournamentsByGame(gameId: number): Promise<Tournament[]>;
  getFeaturedTournaments(): Promise<Tournament[]>;
  getUpcomingTournaments(): Promise<Tournament[]>;
  getLiveTournaments(): Promise<Tournament[]>;
  getCompletedTournaments(): Promise<Tournament[]>;
  getFreeTournaments(): Promise<Tournament[]>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournamentStatus(id: number, status: string): Promise<Tournament | undefined>;
  updateTournamentPlayers(id: number, count: number): Promise<Tournament | undefined>;
  
  // Registration operations
  getRegistrationsByUser(userId: number): Promise<Registration[]>;
  getRegistrationsByTournament(tournamentId: number): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  updateRegistrationStatus(id: number, status: string, placement?: number, earnings?: number): Promise<Registration | undefined>;
  
  // Transaction operations
  getTransactionsByUser(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Session storage
  sessionStore: any; // Using any to avoid type issues with session.SessionStore
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private tournaments: Map<number, Tournament>;
  private registrations: Map<number, Registration>;
  private transactions: Map<number, Transaction>;
  sessionStore: any; // Using any to avoid type issues with session.SessionStore
  
  private userIdCounter: number;
  private gameIdCounter: number;
  private tournamentIdCounter: number;
  private registrationIdCounter: number;
  private transactionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.tournaments = new Map();
    this.registrations = new Map();
    this.transactions = new Map();
    
    this.userIdCounter = 1;
    this.gameIdCounter = 1;
    this.tournamentIdCounter = 1;
    this.registrationIdCounter = 1;
    this.transactionIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Create games
    const gameData: InsertGame[] = [
      { name: "Free Fire", imageUrl: "https://freefiremobile-a.akamaihd.net/ffwebsite/images/freefire32-2.png" },
      { name: "PUBG Mobile", imageUrl: "https://w7.pngwing.com/pngs/944/476/png-transparent-playerunknown-s-battlegrounds-pubg-mobile-fortnite-battle-royale-game-android-game-angle-game-rectangle-thumbnail.png" },
      { name: "Call of Duty", imageUrl: "https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/blog/hero/mw-wz/WZ-Season-Three-Announce-TOUT.jpg" },
      { name: "Fortnite", imageUrl: "https://cdn2.unrealengine.com/24br-s24-egs-launcher-pdp-2560x1440-2560x1440-2a7353b5a438.jpg" }
    ];
    
    gameData.forEach(game => this.createGame(game));
    
    // Create tournaments
    const tournamentData: InsertTournament[] = [
      {
        title: "Free Fire Pro League",
        gameId: 1,
        description: "Battle for glory in the Free Fire Pro League",
        startTime: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
        prizePool: 5000,
        entryFee: 100,
        maxPlayers: 100,
        status: "live",
        tournamentType: "solo",
        featured: true,
        imageUrl: "https://img.fresherslive.com/latestnews/images/articles/origin/2023/07/28/free-fire-max-obm-rush-rush-1-tournament-register-online-64c3a4c4f36c1-1690548420.jpg"
      },
      {
        title: "PUBG Mobile Cup",
        gameId: 2,
        description: "Compete in the PUBG Mobile Cup tournament",
        startTime: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        endTime: new Date(Date.now() + 1000 * 60 * 45), // 45 mins from now
        prizePool: 10000,
        entryFee: 50,
        maxPlayers: 100,
        status: "live",
        tournamentType: "squad",
        featured: true,
        imageUrl: "https://cdn.oneesports.gg/cdn-data/2022/05/PUBGM_PMPL_2022_Spring_SEA.jpg"
      },
      {
        title: "Call of Duty Championship",
        gameId: 3,
        description: "The ultimate Call of Duty showdown",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60 * 3), // 2 days + 3 hours from now
        prizePool: 15000,
        entryFee: 200,
        maxPlayers: 64,
        status: "upcoming",
        tournamentType: "team",
        featured: false,
        imageUrl: "https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/championships/2022/desktop/COD_CWL-Desktop_Championships_Overview_HERO-BANNER.jpg"
      },
      {
        title: "Fortnite Beginners Cup",
        gameId: 4,
        description: "The perfect tournament for Fortnite beginners",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 60 * 4), // 3 days + 4 hours from now
        prizePool: 2000,
        entryFee: 0,
        maxPlayers: 50,
        status: "upcoming",
        tournamentType: "solo",
        featured: false,
        imageUrl: "https://cdn2.unrealengine.com/fortnite-competitive-update-chapter-2-season-6-1920x1080-dc8c70a98462.jpg"
      },
      {
        title: "Free Fire World Series",
        gameId: 1,
        description: "The biggest Free Fire tournament of the year",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 + 1000 * 60 * 60 * 5), // 1 day + 5 hours from now
        prizePool: 25000,
        entryFee: 100,
        maxPlayers: 100,
        status: "upcoming",
        tournamentType: "solo",
        featured: true,
        imageUrl: "https://staticg.sportskeeda.com/editor/2023/11/aeec5-17008069242986-1920.jpg"
      },
      {
        title: "Call of Duty Practice Match",
        gameId: 3,
        description: "Practice your skills in this free tournament",
        startTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
        endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 + 1000 * 60 * 60 * 2), // 1 day + 2 hours from now
        prizePool: 500,
        entryFee: 0,
        maxPlayers: 50,
        status: "upcoming",
        tournamentType: "solo",
        featured: false,
        imageUrl: "https://assets.xboxservices.com/assets/15/02/1502c04d-c508-4364-ae47-53bca9dabba2.jpg"
      }
    ];
    
    tournamentData.forEach(tournament => this.createTournament(tournament));
    
    // Update current players
    this.updateTournamentPlayers(1, 32);
    this.updateTournamentPlayers(2, 78);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, balance: 0, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserBalance(userId: number, newBalance: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (user) {
      user.balance = newBalance;
      this.users.set(userId, user);
      return user;
    }
    return undefined;
  }
  
  // Game operations
  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }
  
  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }
  
  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.gameIdCounter++;
    const game: Game = { ...insertGame, id };
    this.games.set(id, game);
    return game;
  }
  
  // Tournament operations
  async getTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values());
  }
  
  async getTournament(id: number): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }
  
  async getTournamentsByGame(gameId: number): Promise<Tournament[]> {
    return Array.from(this.tournaments.values()).filter(
      tournament => tournament.gameId === gameId
    );
  }
  
  async getFeaturedTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values()).filter(
      tournament => tournament.featured
    );
  }
  
  async getUpcomingTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values()).filter(
      tournament => tournament.status === "upcoming"
    );
  }
  
  async getLiveTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values()).filter(
      tournament => tournament.status === "live"
    );
  }
  
  async getCompletedTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values()).filter(
      tournament => tournament.status === "completed"
    );
  }
  
  async getFreeTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values()).filter(
      tournament => tournament.entryFee === 0
    );
  }
  
  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const id = this.tournamentIdCounter++;
    const tournament: Tournament = { 
      ...insertTournament, 
      id, 
      currentPlayers: 0
    };
    this.tournaments.set(id, tournament);
    return tournament;
  }
  
  async updateTournamentStatus(id: number, status: string): Promise<Tournament | undefined> {
    const tournament = await this.getTournament(id);
    if (tournament) {
      tournament.status = status;
      this.tournaments.set(id, tournament);
      return tournament;
    }
    return undefined;
  }
  
  async updateTournamentPlayers(id: number, count: number): Promise<Tournament | undefined> {
    const tournament = await this.getTournament(id);
    if (tournament) {
      tournament.currentPlayers = count;
      this.tournaments.set(id, tournament);
      return tournament;
    }
    return undefined;
  }
  
  // Registration operations
  async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      registration => registration.userId === userId
    );
  }
  
  async getRegistrationsByTournament(tournamentId: number): Promise<Registration[]> {
    return Array.from(this.registrations.values()).filter(
      registration => registration.tournamentId === tournamentId
    );
  }
  
  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = this.registrationIdCounter++;
    const registeredAt = new Date();
    const registration: Registration = { 
      ...insertRegistration, 
      id, 
      registeredAt, 
      placement: null, 
      earnings: 0 
    };
    this.registrations.set(id, registration);
    
    // Update tournament player count
    const tournament = await this.getTournament(insertRegistration.tournamentId);
    if (tournament) {
      await this.updateTournamentPlayers(tournament.id, tournament.currentPlayers + 1);
    }
    
    return registration;
  }
  
  async updateRegistrationStatus(id: number, status: string, placement?: number, earnings?: number): Promise<Registration | undefined> {
    const registration = this.registrations.get(id);
    if (registration) {
      registration.status = status;
      if (placement !== undefined) {
        registration.placement = placement;
      }
      if (earnings !== undefined) {
        registration.earnings = earnings;
      }
      this.registrations.set(id, registration);
      return registration;
    }
    return undefined;
  }
  
  // Transaction operations
  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by newest first
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const timestamp = new Date();
    const transaction: Transaction = { ...insertTransaction, id, timestamp };
    this.transactions.set(id, transaction);
    
    // Update user balance
    const user = await this.getUser(insertTransaction.userId);
    if (user) {
      const newBalance = user.balance + insertTransaction.amount;
      await this.updateUserBalance(user.id, newBalance);
    }
    
    return transaction;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any to avoid type issues with session.SessionStore

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserBalance(userId: number, newBalance: number): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Game operations
  async getGames(): Promise<Game[]> {
    return db.select().from(games);
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(insertGame).returning();
    return game;
  }

  // Tournament operations
  async getTournaments(): Promise<Tournament[]> {
    return db.select().from(tournaments);
  }

  async getTournament(id: number): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament;
  }

  async getTournamentsByGame(gameId: number): Promise<Tournament[]> {
    return db.select().from(tournaments).where(eq(tournaments.gameId, gameId));
  }

  async getFeaturedTournaments(): Promise<Tournament[]> {
    return db.select().from(tournaments).where(eq(tournaments.featured, true));
  }

  async getUpcomingTournaments(): Promise<Tournament[]> {
    return db.select().from(tournaments).where(eq(tournaments.status, "upcoming"));
  }

  async getLiveTournaments(): Promise<Tournament[]> {
    return db.select().from(tournaments).where(eq(tournaments.status, "live"));
  }

  async getCompletedTournaments(): Promise<Tournament[]> {
    return db.select().from(tournaments).where(eq(tournaments.status, "completed"));
  }

  async getFreeTournaments(): Promise<Tournament[]> {
    return db.select().from(tournaments).where(eq(tournaments.entryFee, 0));
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const [tournament] = await db
      .insert(tournaments)
      .values({ ...insertTournament, currentPlayers: 0 })
      .returning();
    return tournament;
  }

  async updateTournamentStatus(id: number, status: string): Promise<Tournament | undefined> {
    const [updatedTournament] = await db
      .update(tournaments)
      .set({ status })
      .where(eq(tournaments.id, id))
      .returning();
    return updatedTournament;
  }

  async updateTournamentPlayers(id: number, count: number): Promise<Tournament | undefined> {
    const [updatedTournament] = await db
      .update(tournaments)
      .set({ currentPlayers: count })
      .where(eq(tournaments.id, id))
      .returning();
    return updatedTournament;
  }

  // Registration operations
  async getRegistrationsByUser(userId: number): Promise<Registration[]> {
    return db.select().from(registrations).where(eq(registrations.userId, userId));
  }

  async getRegistrationsByTournament(tournamentId: number): Promise<Registration[]> {
    return db.select().from(registrations).where(eq(registrations.tournamentId, tournamentId));
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const [registration] = await db
      .insert(registrations)
      .values(insertRegistration)
      .returning();

    // Update tournament player count
    const tournament = await this.getTournament(insertRegistration.tournamentId);
    if (tournament) {
      await this.updateTournamentPlayers(tournament.id, tournament.currentPlayers + 1);
    }

    return registration;
  }

  async updateRegistrationStatus(
    id: number,
    status: string,
    placement?: number,
    earnings?: number
  ): Promise<Registration | undefined> {
    const updateData: any = { status };
    if (placement !== undefined) {
      updateData.placement = placement;
    }
    if (earnings !== undefined) {
      updateData.earnings = earnings;
    }

    const [updatedRegistration] = await db
      .update(registrations)
      .set(updateData)
      .where(eq(registrations.id, id))
      .returning();
    return updatedRegistration;
  }

  // Transaction operations
  async getTransactionsByUser(userId: number): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.timestamp));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();

    // Update user balance
    const user = await this.getUser(insertTransaction.userId);
    if (user) {
      const newBalance = user.balance + insertTransaction.amount;
      await this.updateUserBalance(user.id, newBalance);
    }

    return transaction;
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
