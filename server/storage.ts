import { type User, type InsertUser, type ServiceType, type InsertServiceType, type Quote, type InsertQuote, type ChatMessage, type InsertChatMessage, type AdminConfig, type InsertAdminConfig } from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private serviceTypes: Map<string, ServiceType>;
  private quotes: Map<string, Quote>;
  private chatMessages: Map<string, ChatMessage>;
  private adminConfig: AdminConfig | undefined;

  constructor() {
    this.users = new Map();
    this.serviceTypes = new Map();
    this.quotes = new Map();
    this.chatMessages = new Map();
    
    // Initialize with default service types
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    const defaultServices: InsertServiceType[] = [
      { name: "Bathtub Refinishing", basePrice: 450, pricePerSqft: 0, complexityMultiplier: 100, active: true },
      { name: "Shower Refinishing", basePrice: 300, pricePerSqft: 0, complexityMultiplier: 100, active: true },
      { name: "Tile Refinishing", basePrice: 700, pricePerSqft: 0, complexityMultiplier: 100, active: true },
      { name: "Countertop Refinishing", basePrice: 500, pricePerSqft: 0, complexityMultiplier: 100, active: true },
    ];

    defaultServices.forEach(service => {
      const id = randomUUID();
      this.serviceTypes.set(id, { 
        id,
        name: service.name,
        basePrice: service.basePrice,
        pricePerSqft: service.pricePerSqft || 0,
        complexityMultiplier: service.complexityMultiplier || 100,
        active: service.active ?? true
      });
    });

    // Initialize default admin config
    this.adminConfig = {
      id: randomUUID(),
      webhookUrl: "",
      llmProvider: "openai",
      llmApiKey: "",
      assistantPrompt: "You are a helpful AI assistant for RefineAI, a bathroom refinishing company. Help customers understand our services and guide them through the quote process.",
      updatedAt: new Date(),
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getServiceTypes(): Promise<ServiceType[]> {
    return Array.from(this.serviceTypes.values()).filter(s => s.active);
  }

  async getServiceType(id: string): Promise<ServiceType | undefined> {
    return this.serviceTypes.get(id);
  }

  async createServiceType(serviceType: InsertServiceType): Promise<ServiceType> {
    const id = randomUUID();
    const newServiceType: ServiceType = { 
      id,
      name: serviceType.name,
      basePrice: serviceType.basePrice,
      pricePerSqft: serviceType.pricePerSqft || 0,
      complexityMultiplier: serviceType.complexityMultiplier || 100,
      active: serviceType.active ?? true
    };
    this.serviceTypes.set(id, newServiceType);
    return newServiceType;
  }

  async updateServiceType(id: string, serviceType: Partial<InsertServiceType>): Promise<ServiceType | undefined> {
    const existing = this.serviceTypes.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...serviceType };
    this.serviceTypes.set(id, updated);
    return updated;
  }

  async getQuotes(): Promise<Quote[]> {
    return Array.from(this.quotes.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async createQuote(quote: InsertQuote): Promise<Quote> {
    const id = randomUUID();
    const newQuote: Quote = { 
      id,
      customerEmail: quote.customerEmail || null,
      customerName: quote.customerName || null,
      serviceTypeId: quote.serviceTypeId || null,
      photoPath: quote.photoPath || null,
      aiAnalysis: quote.aiAnalysis || null,
      totalPrice: quote.totalPrice || null,
      status: quote.status || 'pending',
      createdAt: new Date() 
    };
    this.quotes.set(id, newQuote);
    return newQuote;
  }

  async updateQuote(id: string, quote: Partial<InsertQuote>): Promise<Quote | undefined> {
    const existing = this.quotes.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...quote };
    this.quotes.set(id, updated);
    return updated;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime());
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const newMessage: ChatMessage = { 
      ...message, 
      id, 
      timestamp: new Date() 
    };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }

  async getAdminConfig(): Promise<AdminConfig | undefined> {
    return this.adminConfig;
  }

  async updateAdminConfig(config: InsertAdminConfig): Promise<AdminConfig> {
    const id = this.adminConfig?.id || randomUUID();
    this.adminConfig = { 
      id,
      webhookUrl: config.webhookUrl || null,
      llmProvider: config.llmProvider || 'openai',
      llmApiKey: config.llmApiKey || null,
      assistantPrompt: config.assistantPrompt || null,
      updatedAt: new Date() 
    };
    return this.adminConfig;
  }
}

export const storage = new MemStorage();
