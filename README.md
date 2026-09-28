# ClipGen - AI Creative Video Editor & Ads Studio

ClipGen é uma plataforma profissional de edição de vídeo orientada por IA, inspirada no VibeCut e projetada especificamente para criar anúncios de alta conversão no formato Direct Response (9:16, 1:1, 16:9, etc.).

---

## ✨ Principais Funcionalidades

- **Tela Dividida (Split Screen) com Gradiente Esfumaçado e Blur:**
  - Fusão óptica perfeita entre vídeo de avatar e b-roll com máscara de degradê ajustável (0% a 15%) e blur difuso (`backdrop-filter`).
  - Suporte aos modos suave ou corte reto.
- **B-Rolls Inteligentes & Enquadramento:**
  - Biblioteca integrada de B-Rolls por categoria.
  - Enquadramento interativo e zoom independente com preservação do aspect ratio.
  - Ajuste de velocidade do b-roll (câmera lenta / aceleração) e recorte sem alterar o áudio da cena.
- **Legendas Dinâmicas em Tempo Real & Estilos Visuais:**
  - Estilos predefinidos: *Impacto, Destaque Verde, Karaokê, Tarja Escura, Pílula Branca, Neon Glow, Minimal, Comic Pop, Uma Palavra*, entre outros.
  - Sincronização palavra por palavra gerada com FFmpeg / libass.
  - Posição configurável (Automática, Embaixo, Centro).
- **Headline Interativa com Controle de Duração:**
  - Posicionamento vertical por arrasto direto no player.
  - Opção para manter a Headline durante **todo o vídeo** (`[x] Ficar até o final do vídeo`) ou com timer preciso em segundos.
  - Customização de fontes (Anton, Archivo Black, etc.), cores e tamanhos.
- **Transições Visuais & Efeitos Sonoros Nativos:**
  - 8 transições de cena: *Corte seco, Fade, Flash branco, Zoom punch, Whip lateral, Blur, Glitch, Glare*.
  - Animações CSS com aceleração por hardware e camada `z-50`.
  - Efeitos sonoros dedicados com motor duplo de áudio (síntese PCM WAV em memória + Web Audio API).
  - Controle de volume por cena (0% a 100%) e botão de replicação para todas as cenas.
- **Renderização em Alta Resolução com FFmpeg:**
  - Composição de camadas de tela dividida, sobreposição de b-roll, transições e renderização de legendas dinâmicas em MP4.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React, Vite, Tailwind CSS, Lucide React, Web Audio API
- **Backend:** Node.js, Express, Multer, FFmpeg, ASS Subtitle Engine
- **Estilização:** Paleta Dark profissional com detalhes em Verde Neon (`#C5F955`)

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [FFmpeg](https://ffmpeg.org/) instalado e disponível no PATH do sistema

### 1. Clonar o repositório
```bash
git clone https://github.com/mdmtiv1-collab/ClipGen.git
cd ClipGen
```

### 2. Configurar e Iniciar o Backend
```bash
cd server
npm install
node index.js
```
O servidor estará rodando em `http://localhost:3001`.

### 3. Configurar e Iniciar o Frontend
Em outro terminal:
```bash
cd client
npm install
npm run dev
```
O cliente estará acessível em `http://localhost:3000`.

---

## 📄 Licença
Distribuído sob licença proprietária para uso interno da equipe ClipGen.
