import { GoogleGenerativeAI } from "@google/generative-ai";
import { PricingReference } from "./pricing-reference.js";

export interface AIAnalysis {
  totalPrice: number;
  breakdown: {
    basePrice: number;
    complexityMultiplier: number;
    additionalFees: number;
    laborHours: number;
  };
  complexity: number; // 1-10 scale
  surfaceArea: number; // estimated sq ft
  conditionAssessment: {
    damage: string[];
    cleanability: string; // poor | fair | good | excellent
    existingFinish: string;
  };
  recommendations: string[];
  generatedImageUrl?: string; // URL da imagem gerada
}

export class LLMService {
  private genAI: GoogleGenerativeAI;
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeImage(imageBase64: string, serviceTypeId: string): Promise<AIAnalysis> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro-vision" });
      
      const prompt = this.buildAnalysisPrompt(serviceTypeId);
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: "image/jpeg"
          }
        }
      ]);

      const response = await result.response;
      const analysisText = response.text();
      
      // Parse AI response and calculate pricing
      const analysis = this.parseAIResponse(analysisText);
      
      // Generate renovated image preview
      analysis.generatedImageUrl = await this.generateRenovatedPreview(imageBase64, analysis);
      
      return analysis;
    } catch (error) {
      console.error('Gemini AI analysis error:', error);
      throw new Error('Failed to analyze image with AI');
    }
  }

  private buildAnalysisPrompt(serviceTypeId: string): string {
    return `
    ${PricingReference.PRICING_GUIDE}
    
    Analyze this bathroom photo for refinishing quote. Respond with a JSON object:
    
    {
      "complexity": (1-10 scale),
      "surfaceArea": (estimated square feet),
      "conditionAssessment": {
        "damage": ["array of visible damage"],
        "cleanability": "poor|fair|good|excellent",
        "existingFinish": "description"
      },
      "breakdown": {
        "basePrice": (base cost from guide),
        "complexityMultiplier": (1.0-2.0 based on complexity),
        "additionalFees": (repairs, prep work),
        "laborHours": (estimated hours)
      },
      "recommendations": ["array of recommendations"],
      "totalPrice": (calculated final price)
    }
    
    Focus on:
    - Surface condition and wear
    - Complexity of refinishing needed
    - Additional repairs required
    - Overall project scope
    `;
  }

  private parseAIResponse(response: string): AIAnalysis {
    try {
      // Extract JSON from AI response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and structure the response
      return {
        totalPrice: parsed.totalPrice || 500,
        breakdown: {
          basePrice: parsed.breakdown?.basePrice || 400,
          complexityMultiplier: parsed.breakdown?.complexityMultiplier || 1.2,
          additionalFees: parsed.breakdown?.additionalFees || 100,
          laborHours: parsed.breakdown?.laborHours || 8
        },
        complexity: parsed.complexity || 5,
        surfaceArea: parsed.surfaceArea || 50,
        conditionAssessment: {
          damage: parsed.conditionAssessment?.damage || ["Minor wear"],
          cleanability: parsed.conditionAssessment?.cleanability || "fair",
          existingFinish: parsed.conditionAssessment?.existingFinish || "Standard finish"
        },
        recommendations: parsed.recommendations || ["Standard refinishing process"]
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Fallback analysis
      return {
        totalPrice: 500,
        breakdown: { basePrice: 400, complexityMultiplier: 1.2, additionalFees: 100, laborHours: 8 },
        complexity: 5,
        surfaceArea: 50,
        conditionAssessment: { damage: ["Assessment needed"], cleanability: "fair", existingFinish: "Unknown" },
        recommendations: ["Professional assessment recommended"]
      };
    }
  }

  async generateRenovatedPreview(originalImageBase64: string, analysis: AIAnalysis): Promise<string> {
    try {
      // Use Gemini's image generation capabilities
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const imagePrompt = `
      Create a professional bathroom renovation visualization prompt based on this analysis:
      
      Original Condition: ${analysis.conditionAssessment.existingFinish}
      Complexity: ${analysis.complexity}/10
      Recommended Work: ${analysis.recommendations.join(', ')}
      
      Generate a detailed description for a renovated bathroom that shows:
      1. **Refinished surfaces** - gleaming, like-new appearance
      2. **Professional finish** - smooth, durable coating
      3. **Enhanced color** - fresh, modern bathroom colors
      4. **Improved lighting** - bright, clean presentation
      5. **Professional quality** - commercial-grade refinishing results
      
      Style: Photorealistic, professional bathroom photography, bright lighting, modern refinishing
      Focus: Show the transformation from worn to professionally refinished surfaces
      `;

      const result = await model.generateContent(imagePrompt);
      const response = await result.response;
      const imageDescription = response.text();
      
      // For now, return the description that could be used with image generation APIs
      // In production, this would call Imagen API or similar
      return `data:text/plain;base64,${Buffer.from(imageDescription).toString('base64')}`;
      
    } catch (error) {
      console.error('Error generating preview image:', error);
      return '';
    }
  }

  // Alternative method: Generate actual images (requires Imagen API access)
  async generateActualImage(prompt: string): Promise<string> {
    // This would integrate with Google's Imagen API when available
    // For now, return a placeholder
    return '/api/generated-previews/placeholder.jpg';
  }
}

export default LLMService;