# 🎨 Sistema de Design - UniChurch Mobile

## Filosofia de Design

Inspirado nas melhores práticas de **Airbnb**, **Notion**, **Stripe** e **Calm**, o design do UniChurch Mobile prioriza:

- ✨ **Minimalismo elegante**
- 🌊 **Muito espaço em branco (respiro)**
- 🎯 **Bordas arredondadas e suaves**
- 💎 **Sombras sutis e leves**
- 🎨 **Hierarquia visual clara**
- 📱 **Touch targets adequados**

---

## 🎨 Cores

### Primárias
- **Primary**: `#6366F1` (Indigo vibrante)
- **Primary Dark**: `#4F46E5`
- **Primary Light**: `#818CF8`

### Backgrounds
- **Background**: `#FAFBFC` (Cinza muito claro)
- **Background Secondary**: `#F5F7FA`
- **Card**: `#FFFFFF` (Branco puro)

### Texto
- **Text**: `#1A1A1A` (Preto suave)
- **Text Secondary**: `#6B7280` (Cinza médio)
- **Text Tertiary**: `#9CA3AF` (Cinza claro)

### Bordas
- **Border**: `#E8EBED` (Bordas sutis)
- **Border Light**: `#F1F3F5` (Separadores leves)

---

## 📏 Espaçamentos

Sistema baseado em múltiplos com **muito respiro**:

```javascript
xxs:  2px   // Ajustes mínimos
xs:   6px   // Espaçamentos pequenos
sm:   12px  // Componentes internos
md:   20px  // Padrão entre elementos
lg:   28px  // Seções
xl:   40px  // Grandes divisões
xxl:  56px  // Muito espaço
xxxl: 72px  // Espaçamento máximo
```

**Princípio**: Sempre prefira mais espaço que menos. O respiro é essencial para elegância.

---

## 🔲 Bordas Arredondadas

Intervalo de **12px a 24px** para suavidade visual:

```javascript
xs:   8px   // Badges pequenas
sm:   12px  // Tags e botões pequenos ✨
md:   16px  // Botões secundários ✨
lg:   20px  // Cards secundários ✨
xl:   24px  // Cards principais ✨
xxl:  28px  // Elementos grandes
round: 999px // Círculos perfeitos
```

**Cards principais**: sempre usar `xl` (24px)  
**Botões principais**: sempre usar `lg` (20px)

---

## 🌑 Sombras

Sombras **sutis e leves** para profundidade sem peso visual:

### Subtle
```javascript
shadowOffset: { width: 0, height: 1 }
shadowOpacity: 0.04
shadowRadius: 2
```
*Uso: Separação mínima*

### Small (Padrão para cards)
```javascript
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.06
shadowRadius: 4
```
*Uso: Cards, botões, inputs*

### Medium
```javascript
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.08
shadowRadius: 8
```
*Uso: Modais, menus flutuantes*

### Large
```javascript
shadowOffset: { width: 0, height: 8 }
shadowOpacity: 0.1
shadowRadius: 16
```
*Uso: Elementos em destaque*

**Princípio**: Menos é mais. Sombras devem sugerir elevação, não dominar.

---

## 📝 Tipografia

### Tamanhos
```javascript
xxs:  11px
xs:   13px
sm:   15px
md:   17px  // Padrão corpo
lg:   20px  // Subtítulos
xl:   26px  // Títulos
xxl:  34px  // Títulos grandes
xxxl: 42px  // Hero
```

### Pesos
- **Regular**: 400 (Texto padrão)
- **Medium**: 500 (Ênfase leve)
- **Semibold**: 600 (Botões, títulos menores)
- **Bold**: 700 (Títulos principais)

### Letter Spacing
Use valores negativos para melhor legibilidade em títulos:
- Títulos grandes: `-0.5px`
- Títulos médios: `-0.3px`
- Texto corpo: `-0.2px`
- Texto pequeno: `-0.1px`

---

## 🎯 Touch Targets

Todos os elementos interativos devem ter **altura mínima de 44px** para conforto:

```javascript
// Botões
small:  minHeight: 40px
medium: minHeight: 52px ✨ (Padrão)
large:  minHeight: 60px
```

---

## 📦 Componentes

### Button
- Bordas arredondadas: `lg` (20px)
- Padding generoso
- Sombra sutil
- Estados visuais claros
- Letter spacing ajustado

### Cards (EventCard, GroupCard, PersonCard)
- Bordas arredondadas: `xl` (24px)
- Padding interno: `lg` (28px)
- Sombra: `small`
- Borda sutil: `1px` de `borderLight`
- Muito espaço interno

### InterestTag
- Formato pill (round)
- Padding generoso
- Borda `1.5px` no estado normal
- Borda `2px` no estado selecionado
- Background semi-transparente quando selecionado
- Touch target: 44px mínimo

### Inputs
- Bordas arredondadas: `lg` (20px)
- Padding confortável: `md + 4px`
- Borda sutil: `1px` de `borderLight`
- Sombra leve
- Letter spacing para legibilidade

---

## 🎨 Princípios de Layout

### 1. Respiro é Rei
Sempre prefira **mais espaçamento** entre elementos. O white space é um elemento de design, não desperdício de tela.

### 2. Hierarquia Visual
Use espaçamento, tamanho de fonte e peso para criar hierarquia clara:
- Títulos: `xxl + 2` (36px), bold, letter-spacing negativo
- Subtítulos: `lg` (20px), semibold
- Corpo: `md` (17px), regular
- Secundário: `sm` (15px), regular, cor secundária

### 3. Consistência
- Cards principais sempre `xl` (24px) de border radius
- Espaçamento entre cards sempre `md` (20px)
- Padding de telas sempre `lg` (28px)
- Padding de seções sempre `xl` (40px) no topo

### 4. Ícones
- Use ícones **outline** (finos) preferencialmente
- Tamanho base: `24px` a `28px`
- Emojis como ícones são encorajados para personalidade

### 5. Cores de Estado
- Default: fundos claros (`card`, `backgroundSecondary`)
- Hover/Focus: leve mudança de opacidade
- Selected: background `primaryLight + 20%` (semi-transparente)
- Disabled: `opacity: 0.4`

---

## ✅ Checklist de Design

Ao criar um novo componente, verifique:

- [ ] Bordas arredondadas adequadas (12-24px)?
- [ ] Sombra sutil aplicada?
- [ ] Espaçamento generoso interno e externo?
- [ ] Touch targets de 44px mínimo?
- [ ] Letter spacing para legibilidade?
- [ ] Bordas sutis de 1px onde necessário?
- [ ] Hierarquia visual clara?
- [ ] Cores de estado bem definidas?
- [ ] Respiro suficiente entre elementos?

---

## 🎯 Referências Visuais

### Airbnb
- Espaçamento generoso
- Cards com bordas arredondadas
- Imagens em destaque

### Notion
- Minimalismo
- Ícones simples
- Hierarquia clara

### Stripe
- Sombras sutis
- Bordas leves
- Tipografia impecável

### Calm
- Muito espaço em branco
- Paleta suave
- Sensação zen e confortável

---

## 🚀 Próximos Passos

1. Considerar adicionar **animações suaves** (easing, spring animations)
2. Implementar **dark mode** mantendo os mesmos princípios
3. Criar **biblioteca de ícones** customizados no estilo outline
4. Adicionar **micro-interações** para feedback tátil

---

*Última atualização: Novembro 2025*

