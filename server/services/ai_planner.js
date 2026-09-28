const { getSettings } = require('./settings_manager');
const { getBrollsByCategory } = require('./library_manager');

async function callGemini(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.statusText}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}

async function callOpenRouter(prompt, apiKey) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    })
  });
  if (!res.ok) throw new Error(`OpenRouter error: ${res.statusText}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

/**
 * Detecta o nicho a partir do título do vídeo ou transcrição
 */
function detectNiche(text = '') {
  const lower = text.toLowerCase();
  if (lower.includes('relaciona') || lower.includes('homem') || lower.includes('mulher') || lower.includes('namor') || lower.includes('casal') || lower.includes('casamento') || lower.includes('conquista') || lower.includes('amor')) {
    return 'relacionamento';
  }
  if (lower.includes('emagrec') || lower.includes('dieta') || lower.includes('peso') || lower.includes('gordura') || lower.includes('treino') || lower.includes('barriga') || lower.includes('secar') || lower.includes('fit')) {
    return 'emagrecimento';
  }
  if (lower.includes('atracao') || lower.includes('atração') || lower.includes('mente') || lower.includes('manifest') || lower.includes('universo') || lower.includes('espiritual') || lower.includes('frequencia') || lower.includes('vibra')) {
    return 'lei_da_atracao';
  }
  if (lower.includes('dinheiro') || lower.includes('renda') || lower.includes('conta') || lower.includes('financeir') || lower.includes('salario') || lower.includes('lucro') || lower.includes('venda') || lower.includes('invest')) {
    return 'renda_extra';
  }
  return 'geral';
}

const HEADLINES_BY_NICHE_AND_ANGLE = {
  relacionamento: {
    dor_direta: "DIFICULDADE PRA RECONQUISTAR O AMOR DELA?",
    pergunta_paradoxal: "VOCÊ NÃO PRECISA IMPLORAR ATENÇÃO PRA TER ELA AOS SEUS PÉS",
    novidade: "CHEGOU UM JEITO NOVO DE SALVAR RELACIONAMENTOS EM CRISE",
    historia_pessoal: "EU PERDI O AMOR DA MINHA VIDA ATÉ ENTENDER ESSE ERRO BOBO",
    curiosidade: "O TRUQUE PSICOLÓGICO SIMPLES QUE MUDA QUALQUER RELAÇÃO",
    the_one_thing: "FAÇA ESSA ÚNICA PERGUNTA E NUNCA MAIS SOFRA POR AMOR",
    autoridade: "O MÉTODO QUE TERAPEUTAS DE CASAL GUARDAM A SETE CHAVES",
    prova_social: "MAIS DE 8.000 CASAIS JÁ SALVARAM A RELAÇÃO COM ESSE PADRÃO"
  },
  emagrecimento: {
    dor_direta: "DIFICULDADE PRA QUEIMAR A GORDURA LOCALIZADA?",
    pergunta_paradoxal: "VOCÊ NÃO PRECISA PASSAR FOME PRA SECAR A BARRIGA",
    novidade: "CHEGOU UM RITUAL MATINAL QUE ACELERA A QUEIMA CELULAR",
    historia_pessoal: "EU PESAVA 94KG E ACHAVA QUE MEU METABOLISMO ERA LENTO",
    curiosidade: "O TRUQUE BOBO QUE FAZ O CORPO QUEIMAR GORDURA DORMINDO",
    the_one_thing: "AJUSTE ESSA ÚNICA REFEIÇÃO E SEU CORPO COMEÇA A SECAR",
    autoridade: "O PROTOCOLO QUE MÉDICOS CHAMAM DE REVOLUÇÃO METABÓLICA",
    prova_social: "MAIS DE 12.000 PESSOAS JÁ SECARAM A BARRIGA COM ISSO"
  },
  lei_da_atracao: {
    dor_direta: "DIFICULDADE PRA MANIFESTAR SEUS MAIORES DESEJOS?",
    pergunta_paradoxal: "VOCÊ NÃO PRECISA SE ESFORÇAR MAIS PRA ATRAIR ABUNDÂNCIA",
    novidade: "A NOVA FREQUÊNCIA QUE DESBLOQUEIA A PROSPERIDADE IMEDIATA",
    historia_pessoal: "EU VIVIA NA ESCASSEZ ATÉ ENTENDER ESSA FREQUÊNCIA SECRETA",
    curiosidade: "O CÓDIGO DE 3 MINUTOS QUE ATRAI DINHEIRO INESPERADO",
    the_one_thing: "REPITA ESSA FRASE 1X AO ACORDAR E VEJA TUDO MUDAR",
    autoridade: "O MÉTODO QUE FÍSICOS QUÂNTICOS CHAMAM DE LEI OCULTA",
    prova_social: "MILHARES DE PESSOAS JÁ DESTRAVARAM A VIDA COM ESSA FREQUÊNCIA"
  },
  renda_extra: {
    dor_direta: "DIFICULDADE PRA FAZER O SALÁRIO SOBRAR NO FINAL DO MÊS?",
    pergunta_paradoxal: "VOCÊ NÃO PRECISA GANHAR MAIS PRA SOBRAR DINHEIRO",
    novidade: "CHEGOU UM JEITO NOVO E AUTOMÁTICO DE ORGANIZAR AS CONTAS",
    historia_pessoal: "EU GANHAVA BEM E VIVIA NO VERMELHO TODO SANTO MÊS",
    curiosidade: "O TRUQUE BOBO QUE FEZ MEU SALÁRIO RENDER O MÊS INTEIRO",
    the_one_thing: "FAÇA ISSO 1X POR SEMANA E AS CONTAS SE ORGANIZAM",
    autoridade: "O MÉTODO QUE ESPECIALISTAS CHAMAM DE FUTURO DAS FINANÇAS",
    prova_social: "MILHARES DE BRASILEIROS JÁ ORGANIZARAM AS CONTAS ASSIM"
  },
  geral: {
    dor_direta: "CANSADO DE PERDER TEMPO COM MÉTODOS QUE NÃO FUNCIONAM?",
    pergunta_paradoxal: "VOCÊ NÃO PRECISA SE ESFORÇAR MAIS PRA TER MAIS RESULTADOS",
    novidade: "CHEGOU UMA FORMA TOTALMENTE NOVA DE RESOLVER ISSO",
    historia_pessoal: "EU ERREI DURANTE ANOS ATÉ DESCOBRIR ESSE SEGREDO",
    curiosidade: "O TRUQUE SIMPLES QUE POUCAS PESSOAS TÊM CORAGEM DE REVELAR",
    the_one_thing: "FAÇA APENAS ESSA ÚNICA COISA E VEJA A DIFERENÇA",
    autoridade: "O PADRÃO COMPROVADO PELOS MAIORES ESPECIALISTAS",
    prova_social: "MILHARES DE PESSOAS JÁ COMPROVARAM A EFICÁCIA DISSO"
  }
};

async function generateHeadlineAI({ transcriptText, videoTitle, angle = 'pergunta_paradoxal' }) {
  const combinedContext = `${videoTitle || ''} ${transcriptText || ''}`.trim();
  const niche = detectNiche(combinedContext);
  const settings = getSettings();
  
  if (settings.geminiApiKey || settings.openRouterApiKey) {
    try {
      const prompt = `
Você é o estrategista de copy Direct Response para anúncios de tráfego pago.
Tema / Roteiro do produto: "${combinedContext}"
Nicho detectado: "${niche}"
Ângulo de abordagem: "${angle}" (ex: dor direta, pergunta paradoxal, novidade, história pessoal, curiosidade, the one thing, autoridade, prova social).

IMPORTANTE: A headline DEVE ser 100% sobre o produto/tema específico acima (${niche}). Se o vídeo for sobre relacionamento, fale de relacionamento. Se for emagrecimento, fale de emagrecimento.
Gere 1 headline forte em caixa alta (máximo 10 palavras), sem aspas, com gancho agressivo para os primeiros 3 segundos de retenção.

Responda APENAS em JSON:
{
  "headline": "TEXTO DA HEADLINE EM MAIÚSCULAS"
}
`;
      let aiResult;
      if (settings.geminiApiKey) {
        aiResult = await callGemini(prompt, settings.geminiApiKey);
      } else {
        aiResult = await callOpenRouter(prompt, settings.openRouterApiKey);
      }
      if (aiResult?.headline) {
        return aiResult.headline;
      }
    } catch (err) {
      console.warn('[Headline AI] Fallback to niche templates:', err.message);
    }
  }

  // Fallback baseado no nicho exato
  const nicheMap = HEADLINES_BY_NICHE_AND_ANGLE[niche] || HEADLINES_BY_NICHE_AND_ANGLE.geral;
  return nicheMap[angle] || nicheMap.pergunta_paradoxal;
}

function buildRuleBasedPlan(transcript, selectedCategories = [], template = 'direct_response', totalDuration, videoTitle = '') {
  let availableBrolls = [];
  const { getCategories } = require('./library_manager');

  (selectedCategories || []).forEach(catId => {
    const brolls = getBrollsByCategory(catId);
    brolls.forEach(b => availableBrolls.push(b));
  });

  // If no brolls from selected categories, pick from all library categories
  if (availableBrolls.length === 0) {
    try {
      const allCats = getCategories();
      allCats.forEach(cat => {
        (cat.files || []).forEach(f => {
          availableBrolls.push({
            filename: f.filename,
            category: cat.id,
            url: f.url
          });
        });
      });
    } catch (e) {
      console.warn('Could not load categories for planner:', e.message);
    }
  }

  const words = transcript?.words || [];
  let duration = totalDuration || 20.0;
  if (words.length > 0 && words[words.length - 1].end) {
    duration = Math.max(duration, words[words.length - 1].end);
  }
  duration = Math.max(5.0, duration);

  // Target scene duration ~3.2s to ~3.8s (e.g. 37s -> 10 scenes, matching VibeCut exactly!)
  const targetSceneDuration = 3.6;
  const numScenes = Math.max(3, Math.round(duration / targetSceneDuration));

  // Determine continuous scene cut points
  const cutPoints = [0];
  for (let s = 1; s < numScenes; s++) {
    const targetTime = (s / numScenes) * duration;
    let bestCut = targetTime;

    if (words.length > 0) {
      // Find words near targetTime (within +/- 1.2s)
      const nearbyWords = words.filter(w => Math.abs(w.end - targetTime) <= 1.2);
      if (nearbyWords.length > 0) {
        // Prefer word ending with punctuation
        const punctuated = nearbyWords.filter(w => /[.,?!;:…]$/.test(w.word.trim()));
        if (punctuated.length > 0) {
          bestCut = punctuated[punctuated.length - 1].end;
        } else {
          nearbyWords.sort((a, b) => Math.abs(a.end - targetTime) - Math.abs(b.end - targetTime));
          bestCut = nearbyWords[0].end;
        }
      }
    }

    const prevCut = cutPoints[cutPoints.length - 1];
    if (bestCut > prevCut + 1.4 && bestCut < duration - 1.0) {
      cutPoints.push(Number(bestCut.toFixed(2)));
    }
  }
  cutPoints.push(Number(duration.toFixed(2)));

  // Transitions list matching VibeCut:
  // Corte seco, Fade, Flash branco, Zoom punch, Whip lateral, Blur, Glitch, Flare
  const transitionTypes = ['zoom_punch', 'corte_seco', 'whip_lateral', 'flash_branco', 'fade', 'blur', 'glitch', 'flare'];
  const zoomModes = ['sem_efeito', 'zoom_in', 'zoom_out', 'zoom_punch'];

  const segments = [];
  let brollIndex = 0;

  for (let i = 0; i < cutPoints.length - 1; i++) {
    const start = cutPoints[i];
    const end = cutPoints[i + 1];
    const segDuration = Number((end - start).toFixed(2));

    // Spoken words in this scene
    const sceneWords = words.filter(w => w.start >= start - 0.2 && w.end <= end + 0.2);
    const sceneText = sceneWords.map(w => w.word).join(' ');

    // Scene displayMode:
    // Scene 0: Hook is ALWAYS 'dividida' (split screen: B-roll top + Avatar bottom with red headline)
    let displayMode = 'avatar';
    if (i === 0) {
      displayMode = 'dividida';
    } else if (template === 'direct_response' || template === 'direct-response') {
      const cycle = ['avatar', 'broll', 'dividida', 'avatar', 'broll', 'avatar', 'dividida', 'broll'];
      displayMode = cycle[(i - 1) % cycle.length];
    } else if (template === 'talking_head' || template === 'talking-head') {
      displayMode = (i === 2 || i === 5) ? 'broll' : 'avatar';
    } else if (template === 'vsl') {
      displayMode = (i % 2 === 0) ? 'dividida' : 'broll';
    } else if (template === 'ugc') {
      const ugcCycle = ['dividida', 'broll', 'avatar', 'broll'];
      displayMode = ugcCycle[(i - 1) % ugcCycle.length];
    } else {
      displayMode = (i % 2 === 1) ? 'broll' : 'avatar';
    }

    // Assign contextual B-roll
    let chosenBroll = null;
    if (availableBrolls.length > 0) {
      const textLower = sceneText.toLowerCase();
      const matched = availableBrolls.find(b => {
        const cat = (b.category || '').toLowerCase();
        const fn = (b.filename || '').toLowerCase();
        return (cat && textLower.includes(cat)) || (fn && textLower.includes(fn.replace(/\.[^/.]+$/, '')));
      });
      chosenBroll = matched || availableBrolls[brollIndex % availableBrolls.length];
      brollIndex++;
    } else {
      chosenBroll = {
        filename: `broll_${i + 1}.mp4`,
        category: 'geral',
        url: ''
      };
    }

    const transitionType = transitionTypes[i % transitionTypes.length];
    const zoomMode = (displayMode === 'avatar') ? zoomModes[(i + 1) % zoomModes.length] : 'sem_efeito';

    segments.push({
      id: `seg_${i + 1}`,
      index: i + 1,
      start,
      end,
      duration: segDuration,
      displayMode, // 'dividida' | 'avatar' | 'broll'
      avatarPosition: 'embaixo', // VibeCut standard: B-roll top, Avatar bottom
      maskType: 'suave', // 'suave' (feathered gradient blur) or 'reta'
      maskHeight: 50, // split line height percentage
      broll: chosenBroll,
      zoom: zoomMode,
      transition: {
        type: transitionType,
        direction: (i % 2 === 0) ? 'esquerda' : 'direita',
        sound: 'whip',
        volume: 100
      },
      texture: {
        grain: i % 4 === 0,
        flash: false
      },
      subtitlePosition: 'automatica', // 'automatica' | 'embaixo' | 'centro' | 'sem_legenda'
      text: sceneText,
      label: `Cena ${i + 1}: ${displayMode === 'dividida' ? 'Tela Dividida' : displayMode === 'broll' ? 'B-Roll' : 'Avatar'}`
    });
  }

  const niche = detectNiche(`${videoTitle || ''} ${transcript?.text || ''}`);
  const fallbackHeadline = (HEADLINES_BY_NICHE_AND_ANGLE[niche] || HEADLINES_BY_NICHE_AND_ANGLE.geral).pergunta_paradoxal;

  return {
    headline: {
      text: fallbackHeadline,
      style: "block",
      bgColor: "#dc2626",
      textColor: "#ffffff",
      position: "avatar"
    },
    broll_segments: segments
  };
}

async function planWithOpenRouter({ transcript, availableBrolls, template, duration, videoTitle, angle }) {
  const settings = getSettings();
  const apiKey = settings.openRouterApiKey;
  if (!apiKey) return null;

  const brollSummary = (availableBrolls || []).slice(0, 40).map(b => ({
    filename: b.filename,
    category: b.category
  }));

  const prompt = `
Você é o estrategista e diretor de edição de vídeo Direct Response (estilo VibeCut).
Contexto do vídeo:
- Título: "${videoTitle || ''}"
- Roteiro / Transcrição: "${transcript?.text || ''}"
- Duração total: ${duration} segundos
- Template: "${template}"
- Ângulo de headline: "${angle}"
- B-rolls disponíveis: ${JSON.stringify(brollSummary)}

REQUISITOS OBRIGATÓRIOS:
1. "headline": Headline agressiva Direct Response em CAIXA ALTA (máximo 10 palavras), 100% coerente com o que é falado na transcrição.
2. "scenes": Divida o vídeo em cenas contíguas cobrindo de 0.0 até exatamente ${duration} segundos (cada cena entre 2.5s e 4.5s de duração).
   - Cena 1 DEVE ser "dividida" (Hook com B-roll e Avatar).
   - As demais cenas alternam dinamicamente entre "avatar", "broll" e "dividida".
   - Para cada cena, escolha o "brollFilename" mais pertinente da lista de B-rolls fornecida.
   - Indique "zoom": "sem_efeito", "zoom_in", "zoom_out" ou "zoom_punch".
   - Indique "transition": "corte_seco", "fade", "flash_branco", "zoom_punch", "whip_lateral", "blur", "glitch" ou "flare".

Responda APENAS em JSON no formato:
{
  "headline": "TEXTO DA HEADLINE EM MAIÚSCULAS",
  "scenes": [
    {
      "start": 0.0,
      "end": 3.5,
      "displayMode": "dividida",
      "brollFilename": "nome_do_arquivo.mp4",
      "zoom": "sem_efeito",
      "transition": "zoom_punch"
    }
  ]
}
`;

  try {
    const res = await callOpenRouter(prompt, apiKey);
    if (!res?.scenes || !Array.isArray(res.scenes) || res.scenes.length < 3) {
      return null;
    }
    return res;
  } catch (err) {
    console.warn('[OpenRouter Planning] Error:', err.message);
    return null;
  }
}

async function generateEditingPlan({ transcript, selectedCategories, template, duration, headlineType, customHeadline, videoTitle }) {
  let availableBrolls = [];
  const { getCategories } = require('./library_manager');

  (selectedCategories || []).forEach(catId => {
    const brolls = getBrollsByCategory(catId);
    brolls.forEach(b => availableBrolls.push(b));
  });

  if (availableBrolls.length === 0) {
    try {
      const allCats = getCategories();
      allCats.forEach(cat => {
        (cat.files || []).forEach(f => {
          availableBrolls.push({
            filename: f.filename,
            category: cat.id,
            url: f.url
          });
        });
      });
    } catch (e) {}
  }

  const effectiveDuration = duration || transcript?.words?.[transcript.words.length - 1]?.end || 20.0;
  let plan = null;

  // 1. Tentar Planejamento Completo com OpenRouter AI
  try {
    const aiPlan = await planWithOpenRouter({
      transcript,
      availableBrolls,
      template,
      duration: effectiveDuration,
      videoTitle,
      angle: headlineType || 'pergunta_paradoxal'
    });

    if (aiPlan && aiPlan.scenes && aiPlan.scenes.length >= 3) {
      const words = transcript?.words || [];
      const validatedScenes = [];
      let runningStart = 0;

      for (let i = 0; i < aiPlan.scenes.length; i++) {
        const raw = aiPlan.scenes[i];
        let sStart = runningStart;
        let sEnd = Math.min(effectiveDuration, Math.max(sStart + 1.5, parseFloat(raw.end) || (sStart + 3.5)));
        if (i === aiPlan.scenes.length - 1) {
          sEnd = effectiveDuration;
        }
        runningStart = sEnd;

        // Validar B-roll
        let chosenBroll = availableBrolls.find(b => b.filename === raw.brollFilename);
        if (!chosenBroll && availableBrolls.length > 0) {
          chosenBroll = availableBrolls[i % availableBrolls.length];
        }

        const sceneWords = words.filter(w => w.start >= sStart - 0.2 && w.end <= sEnd + 0.2);
        const sceneText = sceneWords.map(w => w.word).join(' ');

        validatedScenes.push({
          id: `seg_${i + 1}`,
          index: i + 1,
          start: parseFloat(sStart.toFixed(2)),
          end: parseFloat(sEnd.toFixed(2)),
          duration: parseFloat((sEnd - sStart).toFixed(2)),
          displayMode: i === 0 ? 'dividida' : (raw.displayMode || 'avatar'),
          avatarPosition: 'embaixo',
          maskType: 'suave',
          maskHeight: 50,
          broll: chosenBroll || { filename: `broll_${i+1}.mp4`, category: 'geral', url: '' },
          zoom: raw.zoom || 'sem_efeito',
          transition: {
            type: raw.transition || 'zoom_punch',
            direction: i % 2 === 0 ? 'esquerda' : 'direita',
            sound: 'whip',
            volume: 100
          },
          texture: { grain: i % 4 === 0, flash: false },
          subtitlePosition: 'automatica',
          text: sceneText,
          label: `Cena ${i + 1}: ${raw.displayMode === 'dividida' ? 'Tela Dividida' : raw.displayMode === 'broll' ? 'B-Roll' : 'Avatar'}`
        });
      }

      if (validatedScenes.length >= 3) {
        plan = {
          headline: {
            text: aiPlan.headline || 'CANSADA DE ESQUECER ITEM NO MERCADO?',
            style: 'block',
            bgColor: '#dc2626',
            textColor: '#ffffff',
            position: 'avatar'
          },
          broll_segments: validatedScenes
        };
        console.log('[OpenRouter AI] Plano de edição montado com sucesso! Cenas:', validatedScenes.length);
      }
    }
  } catch (err) {
    console.warn('[OpenRouter AI] Fallback para planejamento determinístico:', err.message);
  }

  // 2. Fallback determinístico robusto baseado em pontuação e pausas reais
  if (!plan) {
    plan = buildRuleBasedPlan(transcript, selectedCategories, template, effectiveDuration, videoTitle);
    if (!customHeadline) {
      const aiHeadline = await generateHeadlineAI({
        transcriptText: transcript?.text || '',
        videoTitle: videoTitle || '',
        angle: headlineType || 'pergunta_paradoxal'
      });
      plan.headline.text = aiHeadline;
    }
  }

  if (customHeadline && customHeadline.trim()) {
    plan.headline.text = customHeadline.trim().toUpperCase();
  }

  return plan;
}

module.exports = {
  generateEditingPlan,
  generateHeadlineAI,
  detectNiche,
  HEADLINES_BY_NICHE_AND_ANGLE
};
