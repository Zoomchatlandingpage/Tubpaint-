import { GoogleGenerativeAI } from "@google/generative-ai";
import { COMPANY_PRICING_DOCUMENT } from "../data/company-pricing-document.js";

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

  async analyzeImage(imageBase64: string, serviceTypeName: string): Promise<AIAnalysis> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = this.buildAnalysisPrompt(serviceTypeName);
      
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

  private buildAnalysisPrompt(serviceTypeName: string): string {
    return `
    IMPORTANTE: Leia COMPLETAMENTE este documento de precificação da empresa antes de analisar a imagem:

    ${COMPANY_PRICING_DOCUMENT}

    ---

    TAREFA: Analise esta foto de banheiro para refinishing e calcule o preço DINAMICAMENTE usando APENAS as informações do documento acima.

    NUNCA use preços fixos. TODO preço deve ser calculado dinamicamente baseado em:
    1. Análise visual da imagem (condição, tamanho, complexidade)
    2. Documento de precificação da empresa (acima)
    3. Categoria de serviço: ${serviceTypeName}

    Responda com este JSON exato:
    
    {
      "complexity": (1-10 scale baseado na análise visual),
      "surfaceArea": (área estimada em sq ft da imagem),
      "conditionAssessment": {
        "damage": ["array específico de danos visíveis na foto"],
        "cleanability": "poor|fair|good|excellent",
        "existingFinish": "descrição detalhada do acabamento atual"
      },
      "breakdown": {
        "basePrice": (preço base calculado dinamicamente pelo documento),
        "complexityMultiplier": (multiplicador 1.0-3.0 baseado na complexidade visual),
        "additionalFees": (custos extras: reparos, preparação, etc),
        "laborHours": (horas estimadas baseadas na condição visual)
      },
      "recommendations": ["array de recomendações específicas baseadas na análise visual"],
      "totalPrice": (preço final calculado dinamicamente)
    }

    CRÍTICO: 
    - Analise CUIDADOSAMENTE a imagem para determinar tamanho, condição e complexidade
    - Use o documento de precificação para calcular custos apropriados  
    - NUNCA use valores padrão ou estimativas genéricas
    - Justifique o preço baseado na condição visual real da superfície
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
      
      // Validate and structure the response - SEM valores padrão (100% dinâmico)
      if (!parsed.totalPrice || !parsed.breakdown || !parsed.complexity) {
        throw new Error('AI response missing required pricing calculations');
      }

      return {
        totalPrice: parsed.totalPrice,
        breakdown: {
          basePrice: parsed.breakdown.basePrice,
          complexityMultiplier: parsed.breakdown.complexityMultiplier,
          additionalFees: parsed.breakdown.additionalFees,
          laborHours: parsed.breakdown.laborHours
        },
        complexity: parsed.complexity,
        surfaceArea: parsed.surfaceArea,
        conditionAssessment: {
          damage: parsed.conditionAssessment?.damage || [],
          cleanability: parsed.conditionAssessment?.cleanability || "unknown",
          existingFinish: parsed.conditionAssessment?.existingFinish || "Unknown"
        },
        recommendations: parsed.recommendations || []
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // NO FALLBACK - Sistema 100% dinâmico requer análise válida da LLM
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate dynamic pricing analysis: ${errorMessage}. AI must provide valid pricing calculation based on company document.`);
    }
  }

  async generateRenovatedPreview(originalImageBase64: string, analysis: AIAnalysis): Promise<string> {
    try {
      // Use Gemini's image generation capabilities
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
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