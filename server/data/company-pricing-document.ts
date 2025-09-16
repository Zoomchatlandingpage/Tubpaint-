/**
 * RefineAI - Documento de Precificação da Empresa
 * 
 * Este documento contém TODAS as informações de precificação que a LLM
 * deve usar para calcular preços dinamicamente para cada projeto.
 * 
 * IMPORTANTE: Este é o documento mestre - todos os preços devem ser
 * calculados dinamicamente com base nestas informações + análise da imagem.
 */

export const COMPANY_PRICING_DOCUMENT = `
# REFINEAI - DOCUMENTO MESTRE DE PRECIFICAÇÃO
**Atualizado**: ${new Date().toLocaleDateString()}
**Versão**: 3.0
**Moeda**: USD

## INFORMAÇÕES DA EMPRESA

### RefineAI - Bathroom Refinishing Solutions
- **Experiência**: 15+ anos no mercado
- **Especialização**: Refinishing de banheiros de alta qualidade
- **Região de Atendimento**: Nacional (com variações regionais)
- **Garantia Standard**: 5 anos
- **Certificações**: EPA, OSHA compliant

## ESTRUTURA DE PRECIFICAÇÃO DINÂMICA

### 1. PREÇOS BASE POR CATEGORIA DE SERVIÇO

#### Bathtub Refinishing (Banheiras)
- **Pequena** (até 40 sq ft): $380-520
- **Média** (40-60 sq ft): $480-680
- **Grande** (60+ sq ft): $580-820
- **Vintage/Clawfoot**: +$150-300 premium
- **Jacuzzi/Jet tub**: +$200-400 premium

#### Shower Refinishing (Chuveiros)
- **Walk-in simples**: $420-580
- **Shower/tub combo**: $520-720
- **Glass enclosure**: $580-850
- **Tile surround completo**: +$200-450
- **Multi-head system**: +$100-250

#### Full Bathroom (Banheiro Completo)
- **Half bath** (2 peças): $650-950
- **Full bath** (3-4 peças): $1,200-1,800
- **Master suite**: $1,600-2,400
- **Commercial grade**: +50% premium

#### Tile Refinishing
- **Por sq ft**: $8-15 base
- **Mínimo por projeto**: $280
- **Floor tiles**: +$2-4 per sq ft
- **Decorative/mosaic**: +$3-6 per sq ft

#### Sink & Vanity Refinishing
- **Pedestal sink**: $180-280
- **Vanity top**: $220-380
- **Double vanity**: $350-550
- **Vessel sinks**: +$50-100

### 2. FATORES DE COMPLEXIDADE (Multiplicadores)

#### Nível 1-2: Simples (1.0x - 1.1x)
- Superfícies limpas, pouco desgaste
- Cores padrão (branco, bege, almond)
- Sem reparos estruturais
- Fácil acesso para trabalho

#### Nível 3-4: Moderado (1.2x - 1.4x)
- Desgaste moderado, algumas manchas
- Pequenos chips ou riscos
- Necessita preparação extra
- Mudança de cor simples

#### Nível 5-6: Intermediário (1.5x - 1.7x)
- Danos visíveis múltiplos
- Alguns reparos necessários
- Preparação extensiva
- Cores personalizadas

#### Nível 7-8: Complexo (1.8x - 2.2x)
- Danos estruturais significativos
- Múltiplos reparos grandes
- Condições difíceis de trabalho
- Acabamentos especiais

#### Nível 9-10: Extremo (2.3x - 3.0x)
- Reconstrução parcial necessária
- Condições perigosas (amianto, etc.)
- Acesso muito difícil
- Trabalho de emergência

### 3. CUSTOS DE MATERIAIS E PREPARAÇÃO

#### Preparação de Superfície
- **Limpeza básica**: $45-75
- **Descascamento/scraping**: $75-150
- **Chemical stripping**: $125-250
- **Sanding/grinding**: $100-200
- **Primer special**: $50-120

#### Materiais de Refinishing
- **Standard polyurethane**: Base cost
- **Premium epoxy**: +$80-150
- **Commercial grade**: +$150-300
- **Antimicrobial coating**: +$60-120
- **Textured finish**: +$70-140

#### Reparos Estruturais
- **Chip repair** (pequeno): $25-60 each
- **Crack repair**: $40-100 per linear ft
- **Hole repair**: $75-200 per hole
- **Caulk replacement**: $35-75
- **Hardware replacement**: $45-150

### 4. FATORES DE SUPERFÍCIE E MATERIAL

#### Tipo de Superfície Base
- **Fiberglass**: Base pricing
- **Acrylic**: -5% to -10%
- **Cast iron**: +10% to +20%
- **Steel/Porcelain**: +5% to +15%
- **Natural stone**: +20% to +40%
- **Concrete**: +15% to +30%

#### Idade da Superfície
- **Nova** (0-3 anos): Base pricing
- **Recente** (3-8 anos): +0% to +5%
- **Madura** (8-15 anos): +5% to +15%
- **Antiga** (15-25 anos): +15% to +30%
- **Vintage** (25+ anos): +25% to +50%

### 5. SERVIÇOS ADICIONAIS

#### Preparação Especial
- **Mold treatment**: $85-180
- **Lead paint handling**: $150-350
- **Asbestos precautions**: $200-500
- **Ventilation setup**: $75-150

#### Serviços de Cor e Acabamento
- **Color matching**: $60-120
- **Custom colors**: $80-200
- **Metallic finishes**: +$150-350
- **Textured applications**: +$100-250
- **Logo/design work**: $200-600

#### Urgência e Timing
- **Same day service**: 2.0x multiplier
- **Rush job** (24-48h): 1.5x multiplier
- **Weekend work**: 1.3x multiplier
- **Holiday work**: 1.8x multiplier
- **Night shift**: 1.4x multiplier

### 6. FATORES GEOGRÁFICOS E LOGÍSTICOS

#### Localização
- **Área metropolitana**: +10% to +25%
- **Subúrbio standard**: Base pricing
- **Área rural**: -5% to +15%
- **Zona de alto custo**: +20% to +40%

#### Acesso e Logística
- **Ground floor**: Base pricing
- **Upper floors**: +$50-150
- **Difficult access**: +$75-200
- **Equipment transport**: +$100-300
- **Parking limitations**: +$25-75

### 7. QUALIDADE E GARANTIA

#### Standard Service
- **Garantia**: 3 anos
- **Process**: Single prime + finish
- **Base pricing**: Standard rates

#### Premium Service
- **Garantia**: 5 anos
- **Process**: Multi-coat system
- **Premium**: +25% to +40%

#### Commercial Grade
- **Garantia**: 7-10 anos
- **Process**: Heavy-duty system
- **Premium**: +50% to +80%

### 8. DESCONTOS E PROMOÇÕES

#### Volume Discounts
- **2 bathroom items**: -5%
- **3+ bathroom items**: -10%
- **Whole house**: -15%
- **Commercial contract**: -10% to -20%

#### Seasonal Adjustments
- **Off-season** (Nov-Feb): -5% to -10%
- **Peak season** (Mar-Jun): +5% to +10%
- **Holiday periods**: +10% to +15%

### 9. CÁLCULO DE MÃO DE OBRA

#### Horas Estimadas por Projeto
- **Small bathtub**: 6-10 hours
- **Large shower**: 8-14 hours
- **Full bathroom**: 16-28 hours
- **Complex restoration**: 20-40 hours

#### Taxa Horária Base
- **Técnico standard**: $65-85/hour
- **Técnico senior**: $85-105/hour
- **Specialist work**: $105-130/hour
- **Emergency rates**: $130-180/hour

### 10. MARGEM E OVERHEAD

#### Custos Operacionais
- **Overhead empresarial**: 35-45%
- **Seguro e licenças**: 8-12%
- **Marketing**: 5-8%
- **Margem de lucro**: 20-30%

## INSTRUÇÕES PARA CÁLCULO DINÂMICO

### Para a LLM Analisar Cada Projeto:

1. **AVALIAR A IMAGEM:**
   - Identificar tipo de superfície
   - Medir/estimar área em sq ft
   - Avaliar condição geral (1-10)
   - Identificar danos específicos

2. **APLICAR PRECIFICAÇÃO:**
   - Começar com preço base da categoria
   - Aplicar multiplicador de complexidade
   - Adicionar custos de reparos
   - Incluir fatores de superfície/idade

3. **CONSIDERAR FATORES EXTRAS:**
   - Localização (se informado)
   - Urgência requerida
   - Nível de qualidade desejado
   - Serviços adicionais necessários

4. **CALCULAR TOTAL:**
   - Base + complexidade + reparos + extras
   - Aplicar descontos se aplicável
   - Arredondar para múltiplo de $25
   - Incluir range (+/- 10%) para negociação

### EXEMPLO DE ANÁLISE:
"Banheira de fibra de vidro de 8 anos, 45 sq ft, com alguns chips e desgaste moderado, necessita refinishing standard:"

- Base: $480 (banheira média)
- Complexidade: Nível 4 = 1.3x
- Chips: 3 pequenos = $75
- Idade: 8 anos = +5%
- Cálculo: ($480 × 1.3 + $75) × 1.05 = $734
- Final: $725 (arredondado)

---

**NOTA IMPORTANTE**: Este documento deve ser lido integralmente pela LLM antes de cada análise. Todos os preços devem ser calculados dinamicamente - NUNCA usar valores fixos do banco de dados.
`;

export default COMPANY_PRICING_DOCUMENT;