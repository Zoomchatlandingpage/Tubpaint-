# Tubpaint - Plano de Transformação em Máquina de Vendas Viral

**Data de Início**: 2026-01-16
**Branch de Desenvolvimento**: `claude/project-structure-setup-zNLRt`
**Objetivo**: Transformar o Tubpaint em uma landing page minimalista, focada em conversão, com sistema de tracking de campanhas virais e dashboard admin inteligente.

---

## 📋 ANÁLISE DA SITUAÇÃO ATUAL

### ✅ O que já funciona bem:
- Sistema de cotação com IA (Gemini) completamente funcional
- Schema de banco de dados limpo (Drizzle ORM + PostgreSQL)
- Stack moderno (React 18, TypeScript, Tailwind CSS)
- Upload e processamento de imagens otimizado
- Preços dinâmicos baseados em análise de imagem

### 🔄 O que precisa ser transformado:
- **Landing page complexa demais** (257 linhas, muita informação)
- **47 componentes UI shadcn** (maioria não usada)
- **Funcionalidade duplicada** (quote-form.tsx + quote-modal.tsx)
- **Chat incompleto** (não conectado ao LLM)
- **Admin básico** (sem métricas de campanhas)
- **Sem sistema de tracking** (parâmetros de URL para A/B testing)
- **Sem sistema de prompts** (para personas do vendedor)

---

## 🎯 ESTRUTURA DE TRABALHO (3 PERFIS DE ESPECIALISTAS)

### 1️⃣ DESENVOLVEDOR FULL-STACK (Backend & Dashboard Admin)
**Foco**: Segurança, banco de dados, métricas de campanha

### 2️⃣ ENGENHEIRO DE IA (Integração LLM & Prompts)
**Foco**: Sistema de prompts, chat inteligente, automação

### 3️⃣ DESENVOLVEDOR FRONTEND/UX (Conversão & Marketing Viral)
**Foco**: Landing page minimalista, tracking, A/B testing

---

## 📝 TAREFAS POR PERFIL

## 🟦 PERFIL 1: FULL-STACK (Backend & Admin Dashboard)

### Fase 1.1: Segurança e Autenticação
- [ ] **1.1.1** Substituir autenticação hardcoded por sistema JWT seguro
- [ ] **1.1.2** Criar middleware de autenticação para rotas admin
- [ ] **1.1.3** Implementar hash de senha com bcrypt
- [ ] **1.1.4** Adicionar endpoint de logout e refresh token

### Fase 1.2: Banco de Dados - Tracking de Campanhas
- [ ] **1.2.1** Criar tabela `campaigns` (id, name, source, utmParams, active, createdAt)
- [ ] **1.2.2** Criar tabela `quote_sources` (id, quoteId, campaignId, urlParams, ip, userAgent, timestamp)
- [ ] **1.2.3** Adicionar campo `sourceUrl` e `referrer` na tabela `quotes`
- [ ] **1.2.4** Criar migration para novas tabelas
- [ ] **1.2.5** Atualizar schema Drizzle com novas tabelas

### Fase 1.3: API - Tracking e Métricas
- [ ] **1.3.1** Criar endpoint `POST /api/track/pageview` (captura origem, UTM params)
- [ ] **1.3.2** Criar endpoint `POST /api/track/quote` (associa quote com campanha)
- [ ] **1.3.3** Criar endpoint `GET /api/admin/campaigns` (lista todas campanhas)
- [ ] **1.3.4** Criar endpoint `GET /api/admin/campaigns/:id/metrics` (leads, conversão, receita)
- [ ] **1.3.5** Criar endpoint `POST /api/admin/campaigns` (criar nova campanha)
- [ ] **1.3.6** Criar endpoint `GET /api/admin/analytics/summary` (métricas globais)

### Fase 1.4: Dashboard Admin - Nova Aba "Campanhas"
- [ ] **1.4.1** Criar componente `CampaignMetrics.tsx` (tabela de campanhas com métricas)
- [ ] **1.4.2** Adicionar cards de métricas: Total Leads, Taxa de Conversão, Receita
- [ ] **1.4.3** Criar gráfico de linha (leads por data) usando Recharts
- [ ] **1.4.4** Adicionar tabela com: Campanha | Origem | Leads | Conversão | Receita
- [ ] **1.4.5** Implementar filtro por data (última semana, mês, custom)
- [ ] **1.4.6** Adicionar botão "Nova Campanha" com modal de criação

### Fase 1.5: Dashboard Admin - Melhorias na Aba "Quotes"
- [ ] **1.5.1** Adicionar coluna "Origem da Campanha" na tabela de quotes
- [ ] **1.5.2** Adicionar filtro por campanha/origem
- [ ] **1.5.3** Adicionar botão de exportação CSV (leads + origem)
- [ ] **1.5.4** Mostrar URL de origem ao clicar no quote

---

## 🟩 PERFIL 2: ENGENHEIRO DE IA (LLM & Prompts)

### Fase 2.1: Sistema de Prompts
- [ ] **2.1.1** Criar diretório `/server/prompts/`
- [ ] **2.1.2** Criar arquivo `/server/prompts/vendedor-consultor.md` (persona consultiva)
- [ ] **2.1.3** Criar arquivo `/server/prompts/vendedor-urgencia.md` (persona urgência)
- [ ] **2.1.4** Criar arquivo `/server/prompts/vendedor-educativo.md` (persona educativa)
- [ ] **2.1.5** Criar arquivo `/server/prompts/sistema-base.md` (contexto da empresa)

### Fase 2.2: Gerenciador de Prompts
- [ ] **2.2.1** Criar `prompt-manager.ts` (carrega e gerencia prompts)
- [ ] **2.2.2** Implementar função `loadPrompt(promptName: string)`
- [ ] **2.2.3** Implementar função `getAvailablePrompts()` (lista personas)
- [ ] **2.2.4** Criar cache de prompts em memória
- [ ] **2.2.5** Adicionar validação de prompts no startup

### Fase 2.3: Integração Multi-LLM no Chat
- [ ] **2.3.1** Refatorar `llm-service.ts` para suportar chat (não só análise de imagem)
- [ ] **2.3.2** Implementar método `sendChatMessage(messages[], systemPrompt)`
- [ ] **2.3.3** Adicionar suporte a streaming de respostas
- [ ] **2.3.4** Conectar OpenAI SDK para chat (gpt-4o-mini)
- [ ] **2.3.5** Conectar Anthropic SDK para chat (claude-3-5-sonnet)
- [ ] **2.3.6** Manter Gemini como fallback

### Fase 2.4: WebSocket Chat Inteligente
- [ ] **2.4.1** Atualizar `routes.ts` WebSocket handler para usar LLM
- [ ] **2.4.2** Carregar prompt da persona selecionada
- [ ] **2.4.3** Implementar contexto de conversa (últimas 10 mensagens)
- [ ] **2.4.4** Adicionar rate limiting (máx 20 mensagens por sessão)
- [ ] **2.4.5** Salvar custo de API por mensagem no banco
- [ ] **2.4.6** Implementar tratamento de erros e fallback

### Fase 2.5: Admin - Configuração de Personas
- [ ] **2.5.1** Adicionar select de "Persona Ativa" na aba Configuration
- [ ] **2.5.2** Mostrar preview do prompt selecionado
- [ ] **2.5.3** Adicionar estatísticas de uso do chat (total de mensagens, custo)
- [ ] **2.5.4** Criar toggle "Chat Ativo" (habilitar/desabilitar chat globalmente)

### Fase 2.6: Otimização de Custos
- [ ] **2.6.1** Criar tabela `llm_usage` (sessionId, provider, tokens, cost, timestamp)
- [ ] **2.6.2** Registrar uso de tokens em cada chamada
- [ ] **2.6.3** Criar endpoint `GET /api/admin/llm-costs` (custos por período)
- [ ] **2.6.4** Adicionar card de custos no dashboard admin

---

## 🟨 PERFIL 3: FRONTEND/UX (Conversão & Marketing Viral)

### Fase 3.1: Limpeza e Simplificação da Landing Page
- [ ] **3.1.1** Reduzir `landing.tsx` de 257 linhas para ~150 linhas
- [ ] **3.1.2** Remover seção "Como Funciona" (complexa)
- [ ] **3.1.3** Simplificar Hero: Apenas manchete + sub + CTA "Cotação Rápida"
- [ ] **3.1.4** Remover tabela de preços (já é dinâmico)
- [ ] **3.1.5** Manter apenas: Hero + Quote Form + Footer minimalista
- [ ] **3.1.6** Adicionar seção "Antes & Depois" com 3 fotos

### Fase 3.2: Consolidar Quote Forms
- [ ] **3.2.1** Deletar `quote-modal.tsx` (470 linhas, duplicado)
- [ ] **3.2.2** Manter apenas `quote-form.tsx` inline
- [ ] **3.2.3** Simplificar `quote-form.tsx` (remover histórico de busca)
- [ ] **3.2.4** Melhorar UX mobile (foco em Instagram)
- [ ] **3.2.5** Adicionar loading state mais atraente (skeleton)

### Fase 3.3: Sistema de Parâmetros de URL
- [ ] **3.3.1** Criar hook `useURLParams.ts` (captura ?origem=, ?utm_source=, etc)
- [ ] **3.3.2** Criar contexto `TrackingContext` (armazena params globalmente)
- [ ] **3.3.3** Enviar params para API ao fazer tracking
- [ ] **3.3.4** Salvar params no localStorage (persistir durante sessão)

### Fase 3.4: Variações Dinâmicas (A/B Testing)
- [ ] **3.4.1** Criar arquivo `/client/src/variants.ts` (configurações de variantes)
- [ ] **3.4.2** Implementar variação de manchete:
  - Instagram: "Renove sua Banheira em 24h 🔥"
  - YouTube: "Veja Quanto Custa Renovar Sua Banheira"
  - Facebook: "Banheira Nova Sem Trocar? Descubra o Preço"
- [ ] **3.4.3** Implementar variação de imagem de fundo (3 opções)
- [ ] **3.4.4** Implementar variação de COR do botão (purple, teal, pink)
- [ ] **3.4.5** Criar lógica de seleção de variante baseada em URL params

### Fase 3.5: Scripts de Tracking Dinâmicos
- [ ] **3.5.1** Criar componente `TrackingScripts.tsx`
- [ ] **3.5.2** Injetar Facebook Pixel se `?pixel=fb` ou origem=instagram
- [ ] **3.5.3** Injetar Google Analytics se `?pixel=ga`
- [ ] **3.5.4** Injetar TikTok Pixel se `?pixel=tiktok`
- [ ] **3.5.5** Carregar scripts apenas quando necessário (performance)

### Fase 3.6: Limpeza de Componentes Não Usados
- [ ] **3.6.1** Auditar componentes shadcn usados vs disponíveis
- [ ] **3.6.2** Deletar 30+ componentes UI não utilizados
- [ ] **3.6.3** Manter apenas: Button, Card, Input, Select, Dialog, Badge, Separator, Table
- [ ] **3.6.4** Remover imports e dependências não utilizadas

### Fase 3.7: Chat Somente na Página Oficial
- [ ] **3.7.1** Criar flag `showChat` baseada em URL (só mostrar se não tem params de campanha)
- [ ] **3.7.2** Ocultar `floating-chat-button` em landing pages de campanha
- [ ] **3.7.3** Mostrar chat apenas na URL base (sem params)
- [ ] **3.7.4** Adicionar badge "Beta" no botão de chat

### Fase 3.8: Design System - Otimização
- [ ] **3.8.1** Reduzir palette de cores (manter Purple, Teal, Pink como accent)
- [ ] **3.8.2** Simplificar animações (remover excessos)
- [ ] **3.8.3** Otimizar imagens (WebP, lazy loading)
- [ ] **3.8.4** Reduzir bundle size (code splitting)

### Fase 3.9: Mobile-First Optimization
- [ ] **3.9.1** Testar responsividade em iPhone (Safari)
- [ ] **3.9.2** Ajustar tamanho de fonte para mobile
- [ ] **3.9.3** Aumentar tamanho de botões (melhor touch target)
- [ ] **3.9.4** Testar upload de foto no mobile

---

## 🧪 FASE DE TESTES E VALIDAÇÃO

### Testes de Integração
- [ ] **T1** Testar fluxo completo: Landing → Quote → Admin Dashboard
- [ ] **T2** Testar tracking com parâmetros: `?origem=instagram&utm_source=reels`
- [ ] **T3** Testar variantes A/B (manchetes diferentes)
- [ ] **T4** Testar chat inteligente com cada persona
- [ ] **T5** Testar métricas de campanhas no admin

### Testes de Performance
- [ ] **T6** Lighthouse Score (alvo: >90 mobile)
- [ ] **T7** Tempo de carregamento <2s
- [ ] **T8** Bundle size <500KB
- [ ] **T9** Testar em conexão 3G

### Testes de Segurança
- [ ] **T10** Testar autenticação JWT
- [ ] **T11** Testar rate limiting do chat
- [ ] **T12** Testar proteção de rotas admin
- [ ] **T13** Validar inputs (XSS, SQL injection)

---

## 🚀 ORDEM DE EXECUÇÃO RECOMENDADA

### Sprint 1 (Fundação)
1. **Perfil 1**: Fase 1.2 (DB de Campanhas) + Fase 1.3 (API de Tracking)
2. **Perfil 2**: Fase 2.1 (Sistema de Prompts)
3. **Perfil 3**: Fase 3.3 (Sistema de URL Params)

### Sprint 2 (Core Features)
1. **Perfil 1**: Fase 1.4 (Dashboard de Campanhas)
2. **Perfil 2**: Fase 2.3 + 2.4 (Chat Inteligente)
3. **Perfil 3**: Fase 3.1 + 3.2 (Landing Page Simplificada)

### Sprint 3 (Marketing & Otimização)
1. **Perfil 1**: Fase 1.5 (Melhorias no Admin)
2. **Perfil 2**: Fase 2.6 (Otimização de Custos)
3. **Perfil 3**: Fase 3.4 + 3.5 (A/B Testing + Tracking Scripts)

### Sprint 4 (Polimento & Testes)
1. **Perfil 3**: Fase 3.6 + 3.7 + 3.8 + 3.9 (Limpeza e Otimização)
2. **Todos**: Fase de Testes (T1-T13)
3. **Deploy e Monitoramento**

---

## 📊 MÉTRICAS DE SUCESSO

### Performance
- ✅ Lighthouse Score: >90 (mobile)
- ✅ Time to Interactive: <2s
- ✅ Bundle Size: <500KB

### Conversão
- ✅ Taxa de conversão: >5% (visitante → lead)
- ✅ Tempo para primeira cotação: <30s
- ✅ Bounce rate: <40%

### Custos
- ✅ Custo por lead via IA: <$0.50
- ✅ ROI de campanhas visível no dashboard

---

## 📝 PRÓXIMOS PASSOS

**AGUARDANDO REVISÃO DO PLANO** 🔴

Conforme Regra 3 do CLAUDE.md: **"Antes de começar a trabalhar, contactar o usuário para revisar o plano"**

### Perguntas para o usuário:

1. **Prioridade**: Qual perfil devemos começar primeiro? (Backend, IA ou Frontend?)
2. **Cronograma**: Você quer seguir os 4 sprints ou tem outra preferência?
3. **Personas do Chat**: Você tem alguma preferência para o "tom de voz" do vendedor?
4. **Campanhas Iniciais**: Quais fontes de tráfego você vai usar primeiro? (Instagram, YouTube, Facebook?)
5. **Aprovação**: Este plano está alinhado com sua visão?

---

## 🎯 REVIEW (será preenchido ao final)

_Esta seção será preenchida conforme Regra 7 do CLAUDE.md após a conclusão das tarefas._

### Mudanças Implementadas
- [ ] TBD

### Problemas Encontrados
- [ ] TBD

### Melhorias Sugeridas
- [ ] TBD

### Métricas Finais
- [ ] TBD