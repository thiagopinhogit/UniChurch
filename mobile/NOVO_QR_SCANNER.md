# 📱 Nova Tela de QR Scanner - Versão Moderna

## ✨ Melhorias Implementadas

### 1. **Design Completamente Renovado**

#### Visual Moderno
- Background da câmera com overlay escuro semitransparente
- Moldura de scan com cantos arredondados (estilo iOS)
- Linha animada de scan que se move verticalmente
- Cores e sombras seguindo o design system

#### Hierarquia Visual
- Título grande e destacado no topo
- Subtítulo explicativo
- Área de scan centralizada e evidente
- Botões bem posicionados na parte inferior

### 2. **Nova Funcionalidade: Busca por Localização** 📍

#### Substituiu: "Digitar código manualmente"
#### Novo: "Não tenho QR Code → Buscar igrejas próximas"

**Como funciona:**
1. Usuário clica no botão "Não tenho QR Code"
2. App solicita permissão de localização
3. Busca igrejas próximas (raio de 50km)
4. Exibe lista ordenada por distância

### 3. **Tela de Igrejas Próximas**

Lista elegante mostrando:
- Nome da igreja
- Cidade
- Distância (em metros ou km)
- Card clicável para selecionar
- Ícone de igreja em cada item
- Estado vazio quando não encontra igrejas

### 4. **Animações e Feedback**

- Linha de scan animada (movimento vertical)
- Estados visuais claros (scanning/scanned/loading)
- Botão de retry quando scan falha
- Loading states apropriados

---

## 📂 Arquivos Modificados

### Mobile

#### 1. **QRScannerScreen.js** (Completamente redesenhado)
- Design moderno com moldura de scan
- Animação de linha de scan
- Botão para buscar igrejas próximas
- Estados visuais melhorados

#### 2. **NearbyChurchesScreen.js** (NOVO)
- Lista de igrejas próximas
- Cards clicáveis
- Exibe distância
- Estado vazio elegante

#### 3. **App.js**
- Adicionada rota `NearbyChurches`
- Import da nova tela

#### 4. **services/api.js**
- Nova função: `getNearbyChurches(lat, lng, radius)`

#### 5. **package.json**
- Adicionado: `expo-location`

---

### Backend

#### 1. **models/Church.js**
Adicionados campos:
```javascript
location: {
  type: 'Point',
  coordinates: [longitude, latitude]
},
address: String
```
- Index geoespacial para busca eficiente

#### 2. **routes/church.js**
Novo endpoint:
```
GET /api/churches/nearby?latitude=X&longitude=Y&radius=50
```
- Usa geolocalização do MongoDB
- Calcula distância com fórmula de Haversine
- Retorna igrejas ordenadas por proximidade
- Limite de 20 resultados

#### 3. **seed.js**
- Igreja de exemplo agora tem coordenadas
- Localização: Av. Paulista, São Paulo

---

## 🚀 Como Testar

### 1. Atualizar Banco de Dados
```bash
cd backend
node src/seed.js
```
Isso vai recriar a igreja com localização.

### 2. Testar Scanner
1. Abra o app
2. Clique em "Sou membro"
3. Clique em "Escanear QR Code"
4. Veja o novo design!

### 3. Testar Busca por Localização
1. Na tela de scanner
2. Clique em "Não tenho QR Code"
3. Permita acesso à localização
4. Veja as igrejas próximas
5. Selecione uma para continuar

---

## 🎨 Detalhes de Design

### Cores
- Background overlay: `rgba(0, 0, 0, 0.5)`
- Moldura: Branco com cantos arredondados
- Linha de scan: Primary color com glow
- Botão localização: Card branco com sombra

### Tipografia
- Título: `xxl` (34px), bold
- Subtítulo: `md` (17px), regular
- Botões: `md` (17px), semibold

### Espaçamentos
- Padding geral: `xl` (40px)
- Entre elementos: `lg` (28px)
- Moldura de scan: 280x280px

### Animações
- Scan line: 2s loop (up/down)
- Modal transitions: slide
- Button press: opacity change

---

## 📍 Geolocalização - Detalhes Técnicos

### MongoDB Geospatial Index
```javascript
churchSchema.index({ location: '2dsphere' });
```

### Busca por Proximidade
```javascript
$near: {
  $geometry: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  $maxDistance: radius_in_meters
}
```

### Cálculo de Distância
- Fórmula de Haversine
- Retorna distância em km
- Precisão de 1 casa decimal

---

## 🔒 Permissões Necessárias

### iOS (`Info.plist`)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Precisamos da sua localização para encontrar igrejas próximas.</string>
```

### Android (`AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

*(Expo já gerencia isso automaticamente)*

---

## 🎯 Próximos Passos (Opcional)

1. **Filtros Avançados**
   - Por denominação
   - Por horário de culto
   - Por idioma

2. **Mapa Interativo**
   - Mostrar igrejas em mapa
   - Navegação até a igreja

3. **Cache de Localização**
   - Salvar última busca
   - Não pedir permissão toda vez

4. **Favoritos**
   - Salvar igrejas favoritas
   - Acesso rápido

---

*Atualizado em: Novembro 2025*

