# Features do Xtractor

Este documento lista todas as features disponíveis na aplicação Xtractor, uma plataforma completa de manipulação e conversão de PDFs.

## 📋 Índice

1. [Ferramentas PDF](#ferramentas-pdf)
2. [Autenticação e Gerenciamento de Usuários](#autenticação-e-gerenciamento-de-usuários)
3. [Pagamentos e Assinaturas](#pagamentos-e-assinaturas)
4. [Páginas Estáticas](#páginas-estáticas)
5. [API Routes](#api-routes)
6. [Proteção de Conteúdo](#proteção-de-conteúdo)

---

## 🔧 Ferramentas PDF

A aplicação possui **68 ferramentas PDF** implementadas, organizadas nas seguintes categorias:

### 📎 Anexos e Arquivos

#### 1. **Add Attachments** (`/add-attachments`)
- **Descrição**: Incorpora um ou mais arquivos no PDF
- **Funcionalidade**: Permite adicionar arquivos como anexos ao documento PDF

#### 2. **Extract Attachments** (`/extract-attachments`)
- **Descrição**: Extrai todos os arquivos incorporados de PDF(s) como um arquivo ZIP
- **Funcionalidade**: Recupera anexos de um ou múltiplos PDFs e os compacta em um ZIP

#### 3. **Edit Attachments** (`/edit-attachments`)
- **Descrição**: Visualiza ou remove anexos do PDF
- **Funcionalidade**: Gerencia anexos existentes no documento

---

### 🔀 Mesclagem e Divisão

#### 4. **Merge PDF** (`/merge`)
- **Descrição**: Combina múltiplos PDFs em um único arquivo
- **Funcionalidade**: Une vários documentos PDF em ordem sequencial

#### 5. **Alternate Merge** (`/alternate-merge`)
- **Descrição**: Alterna e mistura páginas de múltiplos arquivos PDF
- **Funcionalidade**: Cria um PDF intercalando páginas de diferentes documentos

#### 6. **Split PDF** (`/split`)
- **Descrição**: Extrai páginas usando intervalo, seleção visual, bookmarks ou outros métodos
- **Funcionalidade**: Divide um PDF em múltiplos arquivos baseado em critérios personalizados

#### 7. **Split Pages in Half** (`/split-in-half`)
- **Descrição**: Divide cada página do documento em duas páginas separadas
- **Funcionalidade**: Permite escolher um método para dividir páginas ao meio

---

### 📄 Gerenciamento de Páginas

#### 8. **Organize PDF** (`/organize`)
- **Descrição**: Reordena e organiza páginas no PDF
- **Funcionalidade**: Permite reorganizar a ordem das páginas

#### 9. **Organize Pages** (`/organize-pages`)
- **Descrição**: Reordena, duplica ou exclui páginas com drag-and-drop
- **Funcionalidade**: Interface visual para gerenciar páginas

#### 10. **Delete Pages** (`/delete-pages`)
- **Descrição**: Remove páginas específicas do documento
- **Funcionalidade**: Permite selecionar e excluir páginas indesejadas

#### 11. **Remove Blank Pages** (`/remove-blank-pages`)
- **Descrição**: Detecta e remove automaticamente páginas em branco ou quase em branco
- **Funcionalidade**: Limpeza automática de páginas vazias

#### 12. **Extract Pages** (`/extract-pages`)
- **Descrição**: Salva uma seleção de páginas como novos arquivos
- **Funcionalidade**: Extrai páginas específicas em arquivos separados

#### 13. **Add Blank Page** (`/add-blank-page`)
- **Descrição**: Insere páginas em branco no PDF
- **Funcionalidade**: Adiciona páginas vazias em posições específicas

#### 14. **Reverse Pages** (`/reverse-pages`)
- **Descrição**: Inverte a ordem das páginas do PDF
- **Funcionalidade**: Reverte completamente a sequência de páginas

#### 15. **Rotate PDF** (`/rotate-pages`)
- **Descrição**: Rotaciona páginas no documento PDF
- **Funcionalidade**: Permite girar páginas em 90°, 180° ou 270°

---

### 🔒 Segurança e Proteção

#### 16. **Encrypt PDF** (`/encrypt`)
- **Descrição**: Adiciona proteção por senha ao PDF
- **Funcionalidade**: Criptografa o documento com senha

#### 17. **Decrypt PDF** (`/decrypt`)
- **Descrição**: Remove proteção por senha do PDF
- **Funcionalidade**: Descriptografa documentos protegidos

#### 18. **Remove Restrictions** (`/remove-restrictions`)
- **Descrição**: Remove restrições de segurança e desbloqueia permissões para edição e impressão
- **Funcionalidade**: Libera PDFs com restrições de uso

#### 19. **Change Permissions** (`/change-permissions`)
- **Descrição**: Modifica senhas e permissões nos documentos PDF
- **Funcionalidade**: Ajusta configurações de segurança do documento

---

### 🎨 Edição Visual e Formatação

#### 20. **Add Watermark** (`/add-watermark`)
- **Descrição**: Adiciona marcas d'água de texto ou imagem ao PDF
- **Funcionalidade**: Insere marca d'água personalizada em todas as páginas

#### 21. **Add Header & Footer** (`/add-header-footer`)
- **Descrição**: Adiciona texto personalizado nas margens superior e inferior de cada página
- **Funcionalidade**: Cria cabeçalhos e rodapés customizados

#### 22. **Add Page Numbers** (`/add-page-numbers`)
- **Descrição**: Adiciona numeração de páginas ao PDF
- **Funcionalidade**: Insere números de página com formatação personalizada

#### 23. **Crop PDF** (`/crop`)
- **Descrição**: Apara as margens de cada página do PDF
- **Funcionalidade**: Remove bordas e ajusta dimensões das páginas

#### 24. **Change Background Color** (`/change-background-color`)
- **Descrição**: Altera a cor de fundo de cada página do PDF
- **Funcionalidade**: Personaliza a cor de fundo do documento

#### 25. **Change Text Color** (`/change-text-color`)
- **Descrição**: Altera a cor do texto escuro no PDF
- **Funcionalidade**: Modifica a cor do texto do documento

#### 26. **Invert Colors** (`/invert-colors`)
- **Descrição**: Cria uma versão "dark mode" do PDF
- **Funcionalidade**: Inverte as cores para modo escuro

#### 27. **PDF to Greyscale** (`/pdf-to-greyscale`)
- **Descrição**: Converte um PDF colorido em versão preto e branco
- **Funcionalidade**: Remove cores e converte para escala de cinza

---

### 📑 Bookmarks e Navegação

#### 28. **Edit Bookmarks** (`/bookmarks`)
- **Descrição**: Adiciona, edita e organiza bookmarks do PDF com destinos personalizados
- **Funcionalidade**: Gerencia a estrutura de navegação do documento

#### 29. **Table of Contents** (`/table-of-contents`)
- **Descrição**: Gera uma página de índice a partir dos bookmarks do PDF
- **Funcionalidade**: Cria sumário automático baseado em bookmarks

---

### 🖼️ Conversão de Imagens para PDF

#### 30. **JPG to PDF** (`/jpg-to-pdf`)
- **Descrição**: Cria um PDF a partir de uma ou mais imagens JPG
- **Funcionalidade**: Converte imagens JPEG para documento PDF

#### 31. **PNG to PDF** (`/png-to-pdf`)
- **Descrição**: Cria um PDF a partir de uma ou mais imagens PNG
- **Funcionalidade**: Converte imagens PNG para documento PDF

#### 32. **BMP to PDF** (`/bmp-to-pdf`)
- **Descrição**: Cria um PDF a partir de uma ou mais imagens BMP
- **Funcionalidade**: Converte imagens BMP para documento PDF

#### 33. **TIFF to PDF** (`/tiff-to-pdf`)
- **Descrição**: Converte uma ou mais imagens TIFF em um único arquivo PDF
- **Funcionalidade**: Converte imagens TIFF para documento PDF

#### 34. **HEIC to PDF** (`/heic-to-pdf`)
- **Descrição**: Converte uma ou mais imagens HEIC do iPhone ou câmera em um único arquivo PDF
- **Funcionalidade**: Suporta formato HEIC do iOS

#### 35. **WebP to PDF** (`/webp-to-pdf`)
- **Descrição**: Converte uma ou mais imagens WebP em um único arquivo PDF
- **Funcionalidade**: Converte imagens WebP modernas para PDF

#### 36. **SVG to PDF** (`/svg-to-pdf`)
- **Descrição**: Cria um PDF a partir de uma ou mais imagens SVG
- **Funcionalidade**: Converte gráficos vetoriais SVG para PDF

#### 37. **Image to PDF** (`/image-to-pdf`)
- **Descrição**: Converte JPG, PNG, WebP, SVG, BMP, HEIC e TIFF para PDF
- **Funcionalidade**: Ferramenta universal para conversão de imagens

#### 38. **Scan to PDF** (`/scan-to-pdf`)
- **Descrição**: Usa a câmera do dispositivo para escanear documentos e salvá-los como PDF
- **Funcionalidade**: Digitalização direta via câmera do dispositivo

---

### 📝 Conversão de Texto e Documentos

#### 39. **JSON to PDF** (`/json-to-pdf`)
- **Descrição**: Converte arquivos JSON (de PDF-to-JSON) de volta para formato PDF
- **Funcionalidade**: Reconstrói PDFs a partir de dados JSON

#### 40. **PDF to JSON** (`/pdf-to-json`)
- **Descrição**: Converte arquivos PDF para formato JSON
- **Funcionalidade**: Extrai estrutura e conteúdo do PDF em JSON

#### 41. **Markdown to PDF** (`/md-to-pdf`)
- **Descrição**: Converte texto Markdown em um documento PDF de alta qualidade
- **Funcionalidade**: Renderiza Markdown como PDF formatado

#### 42. **PDF to Markdown** (`/pdf-to-markdown`)
- **Descrição**: Converte o conteúdo de texto de um PDF em um arquivo Markdown estruturado
- **Funcionalidade**: Extrai texto e estrutura para formato Markdown

#### 43. **Text to PDF** (`/txt-to-pdf`)
- **Descrição**: Converte arquivos de texto ou texto digitado em PDF com formatação personalizada
- **Funcionalidade**: Cria PDFs a partir de texto simples

---

### 🖼️ Conversão de PDF para Imagens

#### 44. **PDF to JPG** (`/pdf-to-jpg`)
- **Descrição**: Converte páginas do PDF em imagens JPG
- **Funcionalidade**: Exporta cada página como imagem JPEG

#### 45. **PDF to PNG** (`/pdf-to-png`)
- **Descrição**: Converte páginas do PDF em imagens PNG
- **Funcionalidade**: Exporta cada página como imagem PNG

#### 46. **PDF to BMP** (`/pdf-to-bmp`)
- **Descrição**: Converte cada página de um PDF em uma imagem BMP
- **Funcionalidade**: Exporta páginas como imagens BMP

#### 47. **PDF to TIFF** (`/pdf-to-tiff`)
- **Descrição**: Converte cada página de um PDF em uma imagem TIFF
- **Funcionalidade**: Exporta páginas como imagens TIFF

#### 48. **PDF to WebP** (`/pdf-to-webp`)
- **Descrição**: Converte cada página de um PDF em uma imagem WebP
- **Funcionalidade**: Exporta páginas como imagens WebP modernas

---

### 📦 Compressão e Otimização

#### 49. **Compress PDF** (`/compress`)
- **Descrição**: Reduz o tamanho do arquivo PDF
- **Funcionalidade**: Otimiza o tamanho do documento

#### 50. **Linearize PDF** (`/linearize`)
- **Descrição**: Otimiza PDFs para visualização rápida na web
- **Funcionalidade**: Melhora o carregamento progressivo do PDF

---

### ✍️ Assinatura e Formulários

#### 51. **Sign PDF** (`/sign-pdf`)
- **Descrição**: Desenha, digita ou faz upload da sua assinatura
- **Funcionalidade**: Adiciona assinatura digital ao documento

#### 52. **PDF Form Filler** (`/form-filler`)
- **Descrição**: Preenche formulários PDF diretamente no navegador com preview ao vivo
- **Funcionalidade**: Editor visual de formulários PDF

#### 53. **Flatten PDF** (`/flatten`)
- **Descrição**: Torna campos de formulário e anotações não editáveis
- **Funcionalidade**: "Congela" o documento para evitar edições

---

### 🗑️ Remoção e Limpeza

#### 54. **Redact PDF** (`/redact`)
- **Descrição**: Remove permanentemente conteúdo sensível dos PDFs
- **Funcionalidade**: Apaga informações de forma irreversível

#### 55. **Remove Annotations** (`/remove-annotations`)
- **Descrição**: Remove anotações (destaques, comentários, desenhos, etc.) do PDF
- **Funcionalidade**: Limpa todas as anotações do documento

#### 56. **Remove Metadata** (`/remove-metadata`)
- **Descrição**: Remove completamente metadados identificadores do PDF
- **Funcionalidade**: Limpa informações de metadados

#### 57. **Sanitize PDF** (`/sanitize`)
- **Descrição**: Remove informações potencialmente sensíveis ou desnecessárias antes de compartilhar
- **Funcionalidade**: Limpeza completa de dados sensíveis

---

### 📊 Metadados e Informações

#### 58. **Edit Metadata** (`/edit-metadata`)
- **Descrição**: Visualiza e modifica metadados do PDF (autor, título, palavras-chave, etc.)
- **Funcionalidade**: Editor de propriedades do documento

#### 59. **View Metadata** (`/view-metadata`)
- **Descrição**: Visualiza metadados completos do PDF incluindo XMP e campos de formulário
- **Funcrição**: Visualização detalhada de todas as informações

---

### 🎭 Transformações Avançadas

#### 60. **Combine to Single Page** (`/combine-single-page`)
- **Descrição**: Une todas as páginas em uma única página contínua
- **Funcionalidade**: Cria um scroll vertical de todas as páginas

#### 61. **N-Up PDF** (`/n-up`)
- **Descrição**: Combina múltiplas páginas em uma única folha
- **Funcionalidade**: Cria layouts como 2-up, 4-up, etc.

#### 62. **Posterize PDF** (`/posterize`)
- **Descrição**: Divide páginas em múltiplas folhas menores para imprimir como pôster
- **Funcionalidade**: Divide páginas grandes em múltiplas folhas

#### 63. **Fix Page Dimensions** (`/fix-dimensions`)
- **Descrição**: Padroniza todas as páginas para um tamanho uniforme
- **Funcionalidade**: Normaliza dimensões de páginas

#### 64. **Page Dimensions** (`/page-dimensions`)
- **Descrição**: Analisa as dimensões, tamanho padrão e orientação de cada página
- **Funcionalidade**: Relatório detalhado de dimensões

---

### 🔍 Comparação e Análise

#### 65. **Compare PDFs** (`/compare-pdfs`)
- **Descrição**: Compara dois PDFs lado a lado ou em modo overlay
- **Funcionalidade**: Ferramenta de comparação visual de documentos

---

### 🛠️ Ferramentas Avançadas

#### 66. **PDF Multi-Tool** (`/multi-tool`)
- **Descrição**: Gerenciamento avançado de páginas: rotaciona, duplica, divide e organiza páginas de múltiplos PDFs
- **Funcionalidade**: Ferramenta tudo-em-um para manipulação complexa

#### 67. **PDF to ZIP** (`/pdf-to-zip`)
- **Descrição**: Combina múltiplos arquivos PDF em um único arquivo ZIP
- **Funcionalidade**: Compacta PDFs em arquivo ZIP

#### 68. **OCR PDF** (`/ocr`)
- **Descrição**: Extrai texto de PDFs escaneados e os torna pesquisáveis
- **Funcionalidade**: Reconhecimento óptico de caracteres para PDFs escaneados

---

## 🔐 Autenticação e Gerenciamento de Usuários

### Clerk Authentication

A aplicação utiliza **Clerk** para autenticação completa:

- **Sign In** (`/sign-in`): Página de login
- **Sign Up** (`/sign-up`): Página de registro
- **User Profile**: Gerenciamento de perfil do usuário
- **Session Management**: Gerenciamento automático de sessões
- **Social Login**: Suporte para login via provedores sociais (Google, GitHub, etc.)

### Gerenciamento de Usuários

- **Sincronização Automática**: Usuários do Clerk são sincronizados automaticamente com o banco de dados
- **Webhooks**: Webhooks do Clerk atualizam dados de usuário em tempo real
- **User Metadata**: Armazenamento de metadados personalizados do usuário

---

## 💳 Pagamentos e Assinaturas

### Clerk Billing Integration

A aplicação utiliza **Clerk Billing** para gerenciamento de assinaturas:

#### Páginas de Assinatura

- **Pricing Page** (`/pricing`): Exibe planos de assinatura usando o componente `<PricingTable />` do Clerk
- **Account Page** (`/account`): Perfil do usuário e gerenciamento de assinatura usando `<UserProfile />` do Clerk

#### Modelos de Banco de Dados

- **User**: Armazena informações do usuário sincronizadas do Clerk
- **Subscription**: Rastreia planos de assinatura e status do usuário
  - Status: `ACTIVE`, `CANCELED`, `EXPIRED`, `PAST_DUE`, `TRIALING`
  - Campos: `plan`, `status`, `currentPeriodStart`, `currentPeriodEnd`, `cancelAtPeriodEnd`
- **BillingHistory**: Registra histórico de pagamentos e faturas
  - Status: `PAID`, `PENDING`, `FAILED`, `REFUNDED`
  - Campos: `amount`, `currency`, `status`, `description`, `billingDate`

#### Webhooks

- **Clerk Webhooks** (`/api/webhooks/clerk`): Recebe eventos do Clerk para sincronizar dados de usuário e assinatura

---

## 📄 Páginas Estáticas

### Páginas Informativas

- **Home** (`/`): Página inicial com apresentação da plataforma
- **About** (`/about`): Sobre a aplicação
- **Contact** (`/contact`): Página de contato
- **FAQ** (`/faq`): Perguntas frequentes
- **Privacy** (`/privacy`): Política de privacidade
- **Terms** (`/terms`): Termos de uso

### Páginas Funcionais

- **Protected** (`/protected`): Página de exemplo de conteúdo protegido
- **Pricing** (`/pricing`): Página de preços e planos

---

## 🔌 API Routes

### User API

#### `GET /api/user`
- **Descrição**: Obtém dados do usuário atual e assinatura
- **Autenticação**: Requerida
- **Resposta**: Dados do usuário e assinatura ativa

#### `GET /api/user/subscription`
- **Descrição**: Obtém assinatura ativa do usuário
- **Autenticação**: Requerida
- **Resposta**: Detalhes da assinatura

#### `GET /api/user/billing-history`
- **Descrição**: Obtém histórico de pagamentos do usuário
- **Autenticação**: Requerida
- **Resposta**: Lista de transações e faturas

### Webhooks

#### `POST /api/webhooks/clerk`
- **Descrição**: Recebe webhooks do Clerk para sincronização de dados
- **Eventos Suportados**:
  - Sincronização de usuários
  - Atualização de assinaturas
  - Eventos de pagamento

---

## 🛡️ Proteção de Conteúdo

### Proteção Baseada em Assinatura

A aplicação suporta proteção de conteúdo baseada em planos de assinatura:

#### Server Components

```typescript
import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  const { has } = await auth();
  const hasPremiumPlan = has({ plan: 'premium' });
  
  if (!hasPremiumPlan) {
    return <div>Conteúdo premium apenas</div>;
  }
  
  return <div>Conteúdo premium aqui</div>;
}
```

#### Client Components

```tsx
'use client';
import { Protect } from '@clerk/nextjs';

export default function Page() {
  return (
    <Protect plan="premium" fallback={<div>Conteúdo premium apenas</div>}>
      <div>Conteúdo premium aqui</div>
    </Protect>
  );
}
```

### Componente ProtectedToolLink

- **Localização**: `src/components/common/ProtectedToolLink.tsx`
- **Funcionalidade**: Componente que protege links de ferramentas baseado em assinatura
- **Uso**: Envolve links de ferramentas para verificar permissões antes de permitir acesso

---

## 📊 Estatísticas

### Resumo de Features

- **Total de Ferramentas PDF**: 68
- **Categorias de Ferramentas**: 12
- **Páginas Estáticas**: 8
- **API Routes**: 4
- **Sistemas de Autenticação**: Clerk
- **Sistemas de Pagamento**: Clerk Billing
- **Modelos de Banco de Dados**: 3 (User, Subscription, BillingHistory)

### Categorias de Ferramentas

1. **Anexos e Arquivos**: 3 ferramentas
2. **Mesclagem e Divisão**: 4 ferramentas
3. **Gerenciamento de Páginas**: 8 ferramentas
4. **Segurança e Proteção**: 4 ferramentas
5. **Edição Visual e Formatação**: 8 ferramentas
6. **Bookmarks e Navegação**: 2 ferramentas
7. **Conversão de Imagens para PDF**: 9 ferramentas
8. **Conversão de Texto e Documentos**: 5 ferramentas
9. **Conversão de PDF para Imagens**: 5 ferramentas
10. **Compressão e Otimização**: 2 ferramentas
11. **Assinatura e Formulários**: 3 ferramentas
12. **Remoção e Limpeza**: 4 ferramentas
13. **Metadados e Informações**: 2 ferramentas
14. **Transformações Avançadas**: 5 ferramentas
15. **Comparação e Análise**: 1 ferramenta
16. **Ferramentas Avançadas**: 3 ferramentas

---

## 🎯 Características Técnicas

### Arquitetura

- **Framework**: Next.js 16 com App Router
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS 4
- **UI Components**: Shadcn UI
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: Clerk
- **Pagamentos**: Clerk Billing
- **Processamento PDF**: pdf-lib, PDF.js, qpdf (via Web Workers)

### Processamento

- **Client-Side Processing**: Todas as operações PDF são processadas no navegador (privacidade garantida)
- **Web Workers**: Operações pesadas executadas em workers para não bloquear a UI
- **Dynamic Imports**: Bibliotecas pesadas carregadas dinamicamente

### Segurança

- **Autenticação Obrigatória**: Todas as ferramentas requerem autenticação
- **Proteção de Conteúdo**: Sistema de proteção baseado em planos
- **Webhook Verification**: Verificação de assinatura em webhooks
- **Input Validation**: Validação de todas as entradas do usuário

---

## 📝 Notas Finais

- Todas as 68 ferramentas estão **implementadas e funcionais**
- O processamento é **100% client-side** (privacidade garantida)
- Suporte completo para **temas claro/escuro**
- Interface **totalmente responsiva**
- **TypeScript** em toda a aplicação para type safety
- **Arquitetura modular** com features organizadas em pastas separadas

---

**Última Atualização**: Dezembro 2024  
**Versão da Aplicação**: 1.0.0

