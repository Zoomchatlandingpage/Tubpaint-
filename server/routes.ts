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

  app.post('/api/quotes', upload.single('photo'), async (req, res) => {
    try {
      const { customerEmail, customerName, serviceTypeId } = req.body;
      
      if (!serviceTypeId) {
        return res.status(400).json({ error: 'Service type is required' });
      }

      const serviceType = await storage.getServiceType(serviceTypeId);
      if (!serviceType) {
        return res.status(400).json({ error: 'Invalid service type' });
      }

      const photoPath = req.file ? req.file.path : undefined;
      let totalPrice = serviceType.basePrice;
      let aiAnalysis = null;

      // AI Processing if photo is uploaded
      if (photoPath) {
        try {
          // Get admin config for AI processing
          const adminConfig = await storage.getAdminConfig();
          
          if (adminConfig?.llmApiKey && adminConfig?.llmProvider === 'gemini') {
            // Validate and process image
            const isValidImage = await ImageProcessor.validateImage(photoPath);
            
            if (isValidImage) {
              // Process image for AI
              const processedImage = await ImageProcessor.processUpload(photoPath);
              
              // Initialize AI service
              const llmService = new LLMService(adminConfig.llmApiKey);
              
              // Analyze image with AI
              aiAnalysis = await llmService.analyzeImage(processedImage.base64, serviceTypeId);
              totalPrice = aiAnalysis.totalPrice;
              
              console.log('AI Analysis completed:', {
                originalPrice: serviceType.basePrice,
                aiPrice: totalPrice,
                complexity: aiAnalysis.complexity
              });
            } else {
              console.log('Invalid image, using base price');
            }
          } else {
            console.log('AI not configured, using base price');
          }
        } catch (aiError) {
          console.error('AI processing failed, falling back to base price:', aiError);
          // Continue with base price if AI fails
        }
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
