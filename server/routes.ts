import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertQuoteSchema, insertChatMessageSchema, insertServiceTypeSchema, insertAdminConfigSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import { LLMService } from "./services/llm-service.js";
import { ImageProcessor } from "./services/image-processor.js";

const upload = multer({ 
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws) => {
    const clientId = randomUUID();
    clients.set(clientId, ws);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat') {
          // Store user message
          await storage.createChatMessage({
            sessionId: message.sessionId,
            role: 'user',
            content: message.content
          });

          // Echo back (in production, this would call AI service)
          const aiResponse = {
            type: 'chat',
            sessionId: message.sessionId,
            role: 'assistant',
            content: `I received your message: "${message.content}". I'm here to help with your bathroom refinishing needs!`,
            timestamp: new Date().toISOString()
          };

          // Store AI response
          await storage.createChatMessage({
            sessionId: message.sessionId,
            role: 'assistant',
            content: aiResponse.content
          });

          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(aiResponse));
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
    });
  });

  // Public API routes
  app.get('/api/service-types', async (req, res) => {
    try {
      const serviceTypes = await storage.getServiceTypes();
      res.json(serviceTypes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch service types' });
    }
  });

  app.get('/api/quotes/search', async (req, res) => {
    try {
      const { email, name } = req.query;
      
      if (!email && !name) {
        return res.status(400).json({ error: 'Email or name parameter is required' });
      }

      const quotes = await storage.searchQuotes(
        typeof email === 'string' ? email : undefined,
        typeof name === 'string' ? name : undefined
      );
      
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to search quotes' });
    }
  });

  app.post('/api/quotes', upload.single('photo'), async (req, res) => {
    try {
      const { customerEmail, customerName, serviceTypeId } = req.body;
      
      if (!serviceTypeId) {
        return res.status(400).json({ error: 'Service type is required' });
      }

      // Sistema 100% dinâmico: FOTO É OBRIGATÓRIA para análise LLM
      if (!req.file) {
        return res.status(400).json({ 
          error: 'Photo is required for dynamic pricing analysis. Please upload a photo of the area to be refinished.' 
        });
      }

      const serviceType = await storage.getServiceType(serviceTypeId);
      if (!serviceType) {
        return res.status(400).json({ error: 'Invalid service type' });
      }

      const photoPath = req.file.path;
      let totalPrice: number;
      let aiAnalysis: any;

      // Get admin config for AI processing
      const adminConfig = await storage.getAdminConfig();
      
      // Simplified Gemini configuration: Use admin API key or environment variable
      // Check for non-empty string, not just truthy value
      const geminiKey = (adminConfig?.llmApiKey && adminConfig.llmApiKey.trim() !== '') ? adminConfig.llmApiKey : process.env.GEMINI_API_KEY;
      
      if (!geminiKey) {
        return res.status(503).json({ 
          error: 'AI pricing service not configured. GEMINI_API_KEY is required for dynamic pricing analysis.' 
        });
      }

      // Validate and process image (OBRIGATÓRIO para sistema dinâmico)
      const isValidImage = await ImageProcessor.validateImage(photoPath);
      
      if (!isValidImage) {
        return res.status(400).json({ 
          error: 'Invalid image format. Please upload a clear photo of the area to be refinished.' 
        });
      }

      // Process image for AI
      const processedImage = await ImageProcessor.processUpload(photoPath);
      
      // Initialize AI service and analyze image (SEM fallbacks)
      const llmService = new LLMService(geminiKey);
      
      try {
        // Analyze image with AI - ÚNICA fonte de precificação
        // CRITICAL: Pass readable service name instead of UUID for LLM analysis
        aiAnalysis = await llmService.analyzeImage(processedImage.base64, serviceType.name);
        totalPrice = aiAnalysis.totalPrice;
        
        console.log('Dynamic AI Pricing completed:', {
          serviceType: serviceType.name,
          dynamicPrice: totalPrice,
          complexity: aiAnalysis.complexity,
          surfaceArea: aiAnalysis.surfaceArea
        });
        
      } catch (aiError) {
        console.error('AI pricing analysis failed:', aiError);
        return res.status(503).json({ 
          error: 'Failed to analyze image for pricing. Please try again with a clearer photo or contact support.',
          details: aiError instanceof Error ? aiError.message : 'AI analysis error'
        });
      }

      const quoteData = {
        customerEmail,
        customerName,
        serviceTypeId,
        photoPath,
        aiAnalysis,
        totalPrice,
        status: 'pending'
      };

      const validatedData = insertQuoteSchema.parse(quoteData);
      const quote = await storage.createQuote(validatedData);

      res.json(quote);
    } catch (error) {
      console.error('Quote creation error:', error);
      res.status(500).json({ error: 'Failed to create quote' });
    }
  });

  app.get('/api/quotes/:id', async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      res.json(quote);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch quote' });
    }
  });

  app.get('/api/chat/:sessionId', async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
  });

  // Admin API routes
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Fixed admin user: Lucas Nascimento
      if (username === 'Lucas Nascimento' && password === 'Createmsa123') {
        res.json({ success: true, token: 'admin-token' });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/admin/quotes', async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch quotes' });
    }
  });

  app.put('/api/admin/quotes/:id', async (req, res) => {
    try {
      const updatedQuote = await storage.updateQuote(req.params.id, req.body);
      if (!updatedQuote) {
        return res.status(404).json({ error: 'Quote not found' });
      }
      res.json(updatedQuote);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update quote' });
    }
  });

  app.get('/api/admin/service-types', async (req, res) => {
    try {
      const serviceTypes = await storage.getServiceTypes();
      res.json(serviceTypes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch service types' });
    }
  });

  app.post('/api/admin/service-types', async (req, res) => {
    try {
      const validatedData = insertServiceTypeSchema.parse(req.body);
      const serviceType = await storage.createServiceType(validatedData);
      res.json(serviceType);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create service type' });
    }
  });

  app.put('/api/admin/service-types/:id', async (req, res) => {
    try {
      const updatedServiceType = await storage.updateServiceType(req.params.id, req.body);
      if (!updatedServiceType) {
        return res.status(404).json({ error: 'Service type not found' });
      }
      res.json(updatedServiceType);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update service type' });
    }
  });

  app.get('/api/admin/config', async (req, res) => {
    try {
      const config = await storage.getAdminConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch config' });
    }
  });

  app.put('/api/admin/config', async (req, res) => {
    try {
      const validatedData = insertAdminConfigSchema.parse(req.body);
      const config = await storage.updateAdminConfig(validatedData);
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update config' });
    }
  });

  return httpServer;
}
