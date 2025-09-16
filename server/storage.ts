import { 
  users, serviceTypes, quotes, chatMessages, adminConfig,
  type User, type InsertUser, type ServiceType, type InsertServiceType, 
  type Quote, type InsertQuote, type ChatMessage, type InsertChatMessage, 
  type AdminConfig, type InsertAdminConfig 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Service Types
  getServiceTypes(): Promise<ServiceType[]>;
  getServiceType(id: string): Promise<ServiceType | undefined>;
  createServiceType(serviceType: InsertServiceType): Promise<ServiceType>;
  updateServiceType(id: string, serviceType: Partial<InsertServiceType>): Promise<ServiceType | undefined>;

  // Quotes
  getQuotes(): Promise<Quote[]>;
  getQuote(id: string): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: string, quote: Partial<InsertQuote>): Promise<Quote | undefined>;

  // Chat Messages
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Admin Config
  getAdminConfig(): Promise<AdminConfig | undefined>;
  updateAdminConfig(config: InsertAdminConfig): Promise<AdminConfig>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize default data on first startup
    this.initializeDefaultData().catch(console.error);
  }

  private async initializeDefaultData() {
    try {
      // Check if service types already exist
      const existingServiceTypes = await db.select().from(serviceTypes).limit(1);
      
      if (existingServiceTypes.length === 0) {
        // Initialize default service types
        const defaultServices: InsertServiceType[] = [
          { name: "Bathtub Refinishing", basePrice: 450, pricePerSqft: 0, complexityMultiplier: 100, active: true },
          { name: "Shower Refinishing", basePrice: 300, pricePerSqft: 0, complexityMultiplier: 100, active: true },
          { name: "Tile Refinishing", basePrice: 700, pricePerSqft: 0, complexityMultiplier: 100, active: true },
          { name: "Countertop Refinishing", basePrice: 500, pricePerSqft: 0, complexityMultiplier: 100, active: true },
        ];

        await db.insert(serviceTypes).values(defaultServices);
      }

      // Check if admin config already exists
      const existingConfig = await db.select().from(adminConfig).limit(1);
      
      if (existingConfig.length === 0) {
        // Initialize default admin config
        const defaultConfig: InsertAdminConfig = {
          webhookUrl: null,
          llmProvider: "openai",
          llmApiKey: null,
          assistantPrompt: "You are a helpful AI assistant for RefineAI, a bathroom refinishing company. Help customers understand our services and guide them through the quote process.",
        };

        await db.insert(adminConfig).values(defaultConfig);
      }
    } catch (error) {
      console.error("Failed to initialize default data:", error);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Service Types
  async getServiceTypes(): Promise<ServiceType[]> {
    return await db.select().from(serviceTypes).where(eq(serviceTypes.active, true));
  }

  async getServiceType(id: string): Promise<ServiceType | undefined> {
    const [serviceType] = await db.select().from(serviceTypes).where(eq(serviceTypes.id, id));
    return serviceType || undefined;
  }

  async createServiceType(serviceType: InsertServiceType): Promise<ServiceType> {
    const [newServiceType] = await db.insert(serviceTypes).values(serviceType).returning();
    return newServiceType;
  }

  async updateServiceType(id: string, serviceType: Partial<InsertServiceType>): Promise<ServiceType | undefined> {
    const [updated] = await db
      .update(serviceTypes)
      .set(serviceType)
      .where(eq(serviceTypes.id, id))
      .returning();
    return updated || undefined;
  }

  // Quotes
  async getQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes).orderBy(desc(quotes.createdAt));
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote || undefined;
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const [newQuote] = await db.insert(quotes).values(quote).returning();
    return newQuote;
  }

  async updateQuote(id: string, quote: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [updated] = await db
      .update(quotes)
      .set(quote)
      .where(eq(quotes.id, id))
      .returning();
    return updated || undefined;
  }

  // Chat Messages
  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.timestamp);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(message).returning();
    return newMessage;
  }

  // Admin Config
  async getAdminConfig(): Promise<AdminConfig | undefined> {
    const [config] = await db.select().from(adminConfig).limit(1);
    return config || undefined;
  }

  async updateAdminConfig(config: InsertAdminConfig): Promise<AdminConfig> {
    // Get existing config
    const existing = await this.getAdminConfig();
    
    if (existing) {
      // Update existing config
      const [updated] = await db
        .update(adminConfig)
        .set(config)
        .where(eq(adminConfig.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new config if none exists
      const [newConfig] = await db.insert(adminConfig).values(config).returning();
      return newConfig;
    }
  }
}

export const storage = new DatabaseStorage();
