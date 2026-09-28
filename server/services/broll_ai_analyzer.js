const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { getSettings } = require('./settings_manager');

const BROLLS_DIR = path.join(__dirname, '..', 'storage', 'brolls');
const METADATA_FILE = path.join(BROLLS_DIR, 'brolls_metadata.json');

// Memory cache of metadata
let metadataCache = null;

function loadMetadata() {
  if (metadataCache) return metadataCache;
  if (fs.existsSync(METADATA_FILE)) {
    try {
      metadataCache = JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));
      return metadataCache;
    } catch (e) {
      console.error('Error reading brolls_metadata.json:', e);
    }
  }
  metadataCache = {};
  return metadataCache;
}

function saveMetadata(data) {
  metadataCache = data;
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving brolls_metadata.json:', e);
  }
}

/**
 * Extract duration in seconds using ffprobe
 */
function getVideoDuration(filePath) {
  try {
    const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`;
    const out = execSync(cmd, { timeout: 3000 }).toString().trim();
    const sec = parseFloat(out);
    return isNaN(sec) ? 10 : sec;
  } catch (e) {
    return 10;
  }
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Intelligent heuristic tag & description extractor from filename and category
 */
const CATEGORY_TAGS_MAP = {
  'Articulações': ['articulações', 'dor', 'inflamação', 'saúde', 'corpo', 'exercício', 'movimento', 'fisioterapia'],
  'Bebidas MIsteriosas': ['bebida', 'detox', 'chá', 'saúde', 'receita', 'ingredientes', 'natural', 'remédio caseiro'],
  'Bumbum': ['glúteo', 'treino', 'academia', 'exercício', 'fitness', 'resultado', 'evolução', 'pernas'],
  'Cara de Dor': ['dor', 'expressão', 'reação', 'incômodo', 'rosto', 'cansaço', 'sensação', 'close-up'],
  'Casal Brigando': ['casal', 'discussão', 'relacionamento', 'conflito', 'dr', 'desentendimento', 'reação'],
  'Casal Feliz': ['casal', 'amor', 'felicidade', 'romance', 'viagem', 'sorriso', 'parceria', 'juntos'],
  'Cidades': ['cidade', 'urbano', 'arquitetura', 'rua', 'viagem', 'edifícios', 'trânsito', 'drone'],
  'Dinheiro': ['dinheiro', 'riqueza', 'finanças', 'sucesso', 'renda', 'cédulas', 'investimento', 'prosperidade'],
  'Espiritualidade': ['espiritualidade', 'paz', 'meditação', 'mente', 'conexão', 'energia', 'universo', 'harmonia'],
  'Fisioterapia': ['fisioterapia', 'alongamento', 'recuperação', 'tratamento', 'reabilitação', 'postura', 'coluna'],
  'Homem - Academia': ['homem', 'academia', 'treino', 'musculação', 'peso', 'força', 'foco', 'motivação'],
  'Homem - Acima do Peso': ['homem', 'peso', 'emagrecimento', 'transformação', 'saúde', 'dieta', 'mudança'],
  'Homem - Chorando': ['homem', 'emoção', 'choro', 'tristeza', 'desabafo', 'sentimento', 'dor'],
  'Homem - Surpresa': ['homem', 'surpresa', 'reação', 'espanto', 'choque', 'olhar', 'expressão'],
  'Instabilidade Financeira': ['finanças', 'dívidas', 'boletos', 'preocupação', 'dinheiro', 'economia', 'estresse'],
  'Lei da Atração': ['lei da atração', 'manifestação', 'mentalidade', 'prosperidade', 'foco', 'pensamento', 'gratidão'],
  'Luxo e Lifestyle': ['luxo', 'lifestyle', 'estilo de vida', 'riqueza', 'mansão', 'viagens', 'elegância', 'alto padrão'],
  'Massagem': ['massagem', 'relaxamento', 'bem-estar', 'terapia', 'alívio', 'estresse', 'corpo'],
  'Maternidade': ['maternidade', 'bebê', 'mãe', 'filho', 'família', 'cuidado', 'amor de mãe', 'gestação'],
  'Mulher - Academia': ['mulher', 'treino', 'academia', 'musculação', 'fitness', 'disposição', 'foco'],
  'Mulher - Acima do Peso': ['mulher', 'peso', 'emagrecimento', 'superação', 'saúde', 'dieta', 'mudança'],
  'Mulher - Chorando': ['mulher', 'choro', 'tristeza', 'desabafo', 'sentimento', 'emoção', 'lágrimas'],
  'Mulher - Surpresa': ['mulher', 'surpresa', 'reação', 'olhar', 'espanto', 'choque', 'expressão'],
  'Mulher Bonita': ['mulher', 'beleza', 'autoestima', 'estilo', 'charme', 'sorriso', 'presença'],
  'Mulher Rica': ['mulher', 'riqueza', 'independência', 'luxo', 'sucesso', 'empoderamento', 'elegância'],
  'Natureza': ['natureza', 'paisagem', 'floresta', 'ar livre', 'verde', 'tranquilidade', 'vida natural'],
  'Pessoas dormindo': ['sono', 'dormir', 'cansaço', 'insônia', 'descanso', 'cama', 'noite'],
  'Receitas Saudaveis': ['receita', 'saudável', 'dieta', 'nutrição', 'alimentação', 'ingredientes', 'preparo'],
  'Universo': ['universo', 'galáxia', 'estrelas', 'cosmos', 'espaço', 'infinito', 'energia']
};

function generateHeuristicMetadata(category, filename, duration) {
  // Extract clean title / ID
  let title = filename.replace(/\.(mp4|mov|webm)$/i, '');
  const idMatch = title.match(/\b\d{10,20}\b/);
  const displayTitle = idMatch ? idMatch[0].slice(0, 14) + '...' : title.slice(0, 16) + '...';

  // Extract hashtags from filename
  const hashtags = (filename.match(/#(\w+)/g) || []).map(h => h.replace('#', '').toLowerCase());

  // Extract clean text words from filename
  let cleanWords = filename
    .replace(/\.(mp4|mov|webm)$/i, '')
    .replace(/[#_\-–]/g, ' ')
    .replace(/\b\d+\b/g, '')
    .split(/\s+/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 3 && !['views', 'saveinsta', 'this', 'that', 'with', 'from', 'your', 'like'].includes(w));

  // Base tags from category
  const baseTags = CATEGORY_TAGS_MAP[category] || [category.toLowerCase(), 'vídeo', 'cena', 'ação'];
  
  // Combine tags uniquely
  const allTags = Array.from(new Set([...hashtags, ...cleanWords.slice(0, 3), ...baseTags])).slice(0, 7);

  // Generate description in Portuguese
  let description = '';
  if (filename.includes('Arthritis') || filename.includes('pain') || category.toLowerCase().includes('dor')) {
    description = `Cena focada em expressão e detalhes corporais de desconforto e dor em ${category.toLowerCase()}.`;
  } else if (category.toLowerCase().includes('casal')) {
    description = `Registro de momento cotidiano e dinâmico entre casal, transmitindo forte apelo emocional.`;
  } else if (category.toLowerCase().includes('academia') || category.toLowerCase().includes('bumbum')) {
    description = `Vídeo de rotina e execução de treino físico focado em resultado corporal e disciplina.`;
  } else if (category.toLowerCase().includes('bebida') || category.toLowerCase().includes('receita')) {
    description = `Preparo e apresentação de receita funcional e prática para rotina de bem-estar.`;
  } else if (category.toLowerCase().includes('maternidade')) {
    description = `Momento materno realista retratando a conexão e a rotina de cuidados com o bebê.`;
  } else {
    description = `Take dinâmico de b-roll em ${category.toLowerCase()} ideal para retenção visual e contextualização de anúncio.`;
  }

  return {
    title: displayTitle,
    fullTitle: title,
    category,
    filename,
    duration,
    durationFormatted: formatDuration(duration),
    date: '24/09/2026',
    description,
    tags: allTags,
    analyzedAt: new Date().toISOString()
  };
}

/**
 * Call OpenRouter with Google Gemini 2.5 Flash to analyze a B-roll
 */
async function analyzeBrollWithAI(category, filename, apiKey) {
  if (!apiKey) {
    const s = getSettings();
    apiKey = s.openRouterApiKey;
  }
  if (!apiKey) {
    throw new Error('Chave da API OpenRouter não configurada nas Configurações.');
  }

  const prompt = `Analise este clipe de B-roll para um editor de anúncios em vídeo.
Categoria: "${category}"
Nome do arquivo / contexto: "${filename}"

Gere uma resposta em JSON com:
1. "description": uma frase objetiva em português (máx. 120 caracteres) descrevendo visualmente o que o vídeo mostra.
2. "tags": lista com 5 a 7 palavras-chave em português (tudo em minúsculas) relacionadas ao que aparece no vídeo, ao nicho e aos ganchos de anúncio.
3. "title": um identificador limpo ou título curto (máx. 14 caracteres).

Formato JSON estrito:
{
  "title": "...",
  "description": "...",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"]
}`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em direção de vídeo, B-rolls e edição de anúncios. Responda APENAS em JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erro na API OpenRouter: ${res.statusText} (${errText.slice(0, 100)})`);
  }

  const data = await res.json();
  const content = JSON.parse(data.choices[0].message.content);

  // Update in storage metadata
  const meta = loadMetadata();
  if (!meta[category]) meta[category] = {};

  const fullPath = path.join(BROLLS_DIR, category, filename);
  const duration = getVideoDuration(fullPath);

  const updatedItem = {
    title: content.title || (filename.slice(0, 14) + '...'),
    fullTitle: filename.replace(/\.(mp4|mov|webm)$/i, ''),
    category,
    filename,
    duration,
    durationFormatted: formatDuration(duration),
    date: '24/09/2026',
    description: content.description || '',
    tags: Array.isArray(content.tags) ? content.tags.map(t => t.toLowerCase()) : [],
    analyzedAt: new Date().toISOString()
  };

  meta[category][filename] = updatedItem;
  saveMetadata(meta);

  return updatedItem;
}

/**
 * Get all brolls with metadata for a category
 */
function getCategoryBrollsWithMetadata(category) {
  const meta = loadMetadata();
  if (!meta[category]) meta[category] = {};

  const catPath = path.join(BROLLS_DIR, category);
  if (!fs.existsSync(catPath)) return [];

  const files = fs.readdirSync(catPath).filter(f => /\.(mp4|mov|webm|mkv|jpg|png|webp)$/i.test(f));
  let modified = false;

  const result = files.map(filename => {
    if (!meta[category][filename]) {
      const fullPath = path.join(catPath, filename);
      const duration = getVideoDuration(fullPath);
      const initialMeta = generateHeuristicMetadata(category, filename, duration);
      meta[category][filename] = initialMeta;
      modified = true;
    }
    const item = meta[category][filename];
    return {
      ...item,
      url: `/storage/brolls/${encodeURIComponent(category)}/${encodeURIComponent(filename)}`
    };
  });

  if (modified) {
    saveMetadata(meta);
  }

  return result;
}

/**
 * Update metadata manually (edit title, description, tags)
 */
function updateBrollMetadata(category, filename, updates) {
  const meta = loadMetadata();
  if (!meta[category]) meta[category] = {};
  if (!meta[category][filename]) {
    const fullPath = path.join(BROLLS_DIR, category, filename);
    const duration = getVideoDuration(fullPath);
    meta[category][filename] = generateHeuristicMetadata(category, filename, duration);
  }

  meta[category][filename] = {
    ...meta[category][filename],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveMetadata(meta);
  return meta[category][filename];
}

/**
 * Delete a broll file and its metadata
 */
function deleteBrollFile(category, filename) {
  const meta = loadMetadata();
  if (meta[category] && meta[category][filename]) {
    delete meta[category][filename];
    saveMetadata(meta);
  }

  const filePath = path.join(BROLLS_DIR, category, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return { success: true, deleted: filename };
}

module.exports = {
  getCategoryBrollsWithMetadata,
  analyzeBrollWithAI,
  updateBrollMetadata,
  deleteBrollFile
};
