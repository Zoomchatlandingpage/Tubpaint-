# 🔍 MAPEAMENTO COMPLETO: Upload + LLM Integration

## 📊 Fluxo Atual vs Fluxo Desejado

### 🔄 FLUXO ATUAL (Sem IA)
```
1. Cliente Upload → QuoteForm
2. Arquivo → uploads/ (Multer)
3. Preço → serviceType.basePrice (fixo)
4. Quote → Database (status: pending)
5. Admin → Gerencia manualmente
```

### 🤖 FLUXO DESEJADO (Com IA)
```
1. Cliente Upload → QuoteForm
2. Arquivo → uploads/ + LLM Processing
3. IA Analisa → Imagem + Documento Referência
4. Preço → IA calcula baseado em análise
5. Quote → Database (com aiAnalysis)
6. Admin → Gerencia + configura IA
```

---

## 🗺️ MAPEAMENTO TÉCNICO DETALHADO

### 📁 Frontend: Upload Interface
**Arquivo:** `client/src/components/quote-form.tsx`
```typescript
// Upload Component
<input type="file" accept="image/*" onChange={handleFileChange} />

// FormData Creation
const submitData = new FormData();
submitData.append('photo', selectedFile);  // ← Arquivo vai aqui
submitData.append('customerName', formData.customerName);
submitData.append('serviceTypeId', formData.serviceTypeId);

// API Call
fetch('/api/quotes', { method: 'POST', body: submitData })
```

### 🛜 Backend: Upload Processing
**Arquivo:** `server/routes.ts:86`
```typescript
app.post('/api/quotes', upload.single('photo'), async (req, res) => {
  const photoPath = req.file ? req.file.path : undefined;  // ← uploads/filename
  
  // 🚨 PROBLEMA: Só usa preço base (sem IA)
  const totalPrice = serviceType.basePrice;
  
  // ✅ FUTURO: Aqui entra processamento IA
  // const aiAnalysis = await processImageWithLLM(photoPath);
  // const totalPrice = calculatePriceFromAI(aiAnalysis);
})
```

### 💾 Database Schema
**Arquivo:** `shared/schema.ts`
```typescript
export const quotes = pgTable("quotes", {
  id: varchar("id").primaryKey(),
  photoPath: text("photo_path"),           // ✅ Caminho da foto
  aiAnalysis: jsonb("ai_analysis"),        // 🎯 Para resultado da IA
  totalPrice: integer("total_price"),      // 🎯 Preço calculado
  status: text("status").default("pending")
});

export const adminConfig = pgTable("admin_config", {
  llmProvider: text("llm_provider"),       // 🤖 openai|anthropic|gemini
  llmApiKey: text("llm_api_key"),         // 🔑 API Key da IA
  assistantPrompt: text("assistant_prompt") // 📋 Prompt para IA
});
```

### 🎛️ Admin System
**Arquivo:** `client/src/pages/admin.tsx`
```typescript
// Gerenciamento de Quotes
const { data: quotes } = useQuery(['/api/admin/quotes']);

// Configuração da IA
const { data: config } = useQuery(['/api/admin/config']);
// ↳ Onde admin configura: Provider, API Key, Prompts
```

---

## 🎯 PIPELINE NECESSÁRIO PARA LLM

### 1. 📸 Image Processing
```typescript
// server/services/image-processor.ts (CRIAR)
export async function processImageWithLLM(imagePath: string) {
  const imageBuffer = await fs.readFile(imagePath);
  const base64Image = imageBuffer.toString('base64');
  
  // Enviar para LLM (OpenAI/Anthropic/Gemini)
  const analysis = await callLLMAPI({
    image: base64Image,
    prompt: "Analyze this bathroom photo for refinishing quote..."
  });
  
  return analysis;
}
```

### 2. 🧠 LLM Integration
```typescript
// server/services/llm-service.ts (CRIAR)
export class LLMService {
  async analyzeImage(imageBase64: string, referenceDoc: string) {
    const prompt = `
    Based on this bathroom image and our pricing document:
    ${referenceDoc}
    
    Analyze:
    - Surface area needed
    - Complexity level (1-10)
    - Materials required
    - Estimated labor hours
    
    Return JSON: { totalPrice, breakdown, complexity }
    `;
    
    // Chamar API da IA escolhida
    const result = await this.callLLM(prompt, imageBase64);
    return result;
  }
}
```

### 3. 📋 Reference Document System
```typescript
// server/services/pricing-reference.ts (CRIAR)
export class PricingReference {
  // Documento base para IA calcular preços
  static PRICING_GUIDE = `
  BATHROOM REFINISHING PRICING GUIDE:
  
  Base Rates:
  - Bathtub refinishing: $300-600
  - Shower refinishing: $400-800
  - Full bathroom: $800-1500
  
  Complexity Multipliers:
  - Simple (1-3): 1.0x
  - Medium (4-6): 1.5x  
  - Complex (7-10): 2.0x
  
  Additional Factors:
  - Chip repair: +$50-150
  - Color change: +$100-200
  - Surface preparation: +$75-300
  `;
}
```

---

## 🔧 IMPLEMENTAÇÃO NECESSÁRIA

### 📦 Dependências a Adicionar
```bash
npm install openai @anthropic-ai/sdk @google/generative-ai
```

### 🗂️ Arquivos a Criar
```
server/
├── services/
│   ├── llm-service.ts          # Integração IA
│   ├── image-processor.ts      # Processamento imagem
│   └── pricing-reference.ts    # Documento referência
├── config/
│   └── llm-providers.ts       # Config providers
└── middleware/
    └── ai-processing.ts       # Middleware IA
```

### 🔄 Modificações Necessárias

#### 1. **routes.ts** - Adicionar processamento IA
```typescript
app.post('/api/quotes', upload.single('photo'), async (req, res) => {
  const photoPath = req.file?.path;
  
  if (photoPath) {
    // 🆕 Processar com IA
    const aiAnalysis = await processImageWithLLM(photoPath);
    const totalPrice = aiAnalysis.totalPrice;
    
    quoteData.aiAnalysis = aiAnalysis;
    quoteData.totalPrice = totalPrice;
  }
  
  // Continuar com criação do quote
});
```

#### 2. **admin.tsx** - Adicionar configuração IA
```typescript
// 🆕 Seção para configurar IA
<TabsContent value="ai-config">
  <Card>
    <CardHeader>
      <CardTitle>AI Configuration</CardTitle>
    </CardHeader>
    <CardContent>
      <Select value={config?.llmProvider}>
        <SelectItem value="openai">OpenAI GPT-4</SelectItem>
        <SelectItem value="anthropic">Anthropic Claude</SelectItem>
        <SelectItem value="gemini">Google Gemini</SelectItem>
      </Select>
      
      <Input 
        type="password" 
        placeholder="API Key"
        value={config?.llmApiKey}
      />
      
      <Textarea
        placeholder="Custom prompt for image analysis..."
        value={config?.assistantPrompt}
      />
    </CardContent>
  </Card>
</TabsContent>
```

---

## 🎯 RESULTADO FINAL ESPERADO

### 📸 Cliente envia foto
1. **Upload realizado** → `uploads/photo.jpg`
2. **IA processa imagem** → Analisa complexidade, área, condições
3. **IA consulta referência** → Documento de preços configurado pelo admin
4. **Preço calculado** → Base + complexidade + fatores especiais
5. **Quote salvo** → Database com análise completa da IA
6. **Cliente recebe** → Orçamento preciso em segundos

### 🎛️ Admin gerencia tudo
1. **Configura provider IA** → OpenAI, Anthropic ou Gemini
2. **Define API keys** → Conexão com serviços IA
3. **Customiza prompts** → Como IA deve analisar fotos
4. **Atualiza referências** → Documento de preços base
5. **Monitora quotes** → Vê análises da IA e ajusta preços

### 💡 Benefícios
- ✅ **Orçamentos instantâneos** precisos
- ✅ **Análise visual automática** de complexidade
- ✅ **Preços dinâmicos** baseados em IA
- ✅ **Gestão centralizada** pelo admin
- ✅ **Múltiplos providers IA** (OpenAI, Claude, Gemini)

---

## 📋 PRÓXIMOS PASSOS

1. **Implementar LLM Service** → Integração com APIs de IA
2. **Adicionar processamento de imagem** → Upload → IA → Preço  
3. **Criar interface admin** → Configuração de IA
4. **Adicionar loading states** → UX durante processamento
5. **Testar pipeline completo** → Upload → IA → Quote → Admin