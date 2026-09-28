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
 * Detecta o idioma do texto (Espanhol, Português ou Inglês)
 */
function detectLanguage(text = '') {
  if (!text || typeof text !== 'string') return 'pt';
  const raw = text.toLowerCase();
  
  // 1. Caracteres tipográficos inconfundíveis do Espanhol
  if (text.includes('¿') || text.includes('¡') || raw.includes('ñ')) {
    return 'es';
  }
  
  // 2. Caracteres tipográficos inconfundíveis do Português
  if (raw.includes('ç') || raw.includes('ã') || raw.includes('õ')) {
    return 'pt';
  }
  
  // 3. Frequência de palavras exclusivas / stopwords
  const tokens = raw.replace(/[^\w\sáéíóúâêîôûãõàèìòùäëïöüñç]/g, ' ')
                    .split(/\s+/)
                    .filter(Boolean);

  let esScore = 0;
  let ptScore = 0;
  let enScore = 0;

  const esExclusive = new Set([
    'del', 'los', 'las', 'un', 'una', 'unos', 'unas', 'tu', 'tus', 'su', 'sus',
    'pero', 'hacer', 'hace', 'haces', 'hacen', 'haciendo', 'hecho', 'este', 'estos', 'estas',
    'gimnasio', 'entrenamiento', 'cancha', 'futbol', 'fútbol', 'futbolista', 'futbolistas',
    'jugada', 'jugadas', 'partido', 'partidos', 'rutina', 'rutinas', 'campo',
    'más', 'ayudarte', 'debería', 'deberia', 'tienes', 'tiene', 'tienen', 'tenemos',
    'abres', 'sigues', 'sabes', 'sabe', 'objetivo', 'dentro', 'fuera', 'alguien',
    'también', 'tambien', 'accede', 'empieza', 'mejorar', 'fuerza', 'potencia', 'clic',
    'porque', 'cuando', 'siempre', 'ahora', 'después', 'despues', 'donde', 'hacia',
    'mira', 'mismo', 'misma', 'mismos', 'mismas', 'puedes', 'puede', 'pueden', 'quieres'
  ]);

  const ptExclusive = new Set([
    'você', 'voce', 'vocês', 'voces', 'vc', 'vcs', 'não', 'nao', 'pra', 'pro', 'pras', 'pros',
    'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'um', 'uma', 'uns', 'umas',
    'seu', 'sua', 'seus', 'suas', 'mas', 'fazer', 'faz', 'fazem', 'fazendo', 'feito',
    'academia', 'treino', 'treinos', 'treinar', 'futebol', 'jogador', 'jogadores',
    'jogada', 'jogadas', 'jogo', 'jogos', 'rotina', 'rotinas', 'campo',
    'mais', 'ajudar', 'ajuda', 'deveria', 'tem', 'temos', 'têm', 'tenham',
    'abra', 'siga', 'sabe', 'sabem', 'alguém', 'alguem', 'também', 'tambem',
    'acesse', 'comece', 'porque', 'por que', 'quando', 'sempre', 'agora', 'depois', 'onde',
    'olha', 'mesmo', 'mesma', 'mesmos', 'mesmas', 'pode', 'podem', 'quer'
  ]);

  const enExclusive = new Set([
    'the', 'and', 'you', 'your', 'yours', 'to', 'for', 'in', 'is', 'are', 'of', 'this',
    'that', 'these', 'those', 'with', 'without', 'not', 'have', 'has', 'had', 'from',
    'they', 'them', 'their', 'what', 'which', 'who', 'when', 'where', 'why', 'how',
    'training', 'routine', 'better', 'now', 'click', 'more', 'just', 'like', 'about',
    'can', 'could', 'would', 'should', 'make', 'doing', 'start', 'watch', 'video'
  ]);

  for (const token of tokens) {
    if (esExclusive.has(token)) esScore += 2;
    if (ptExclusive.has(token)) ptScore += 2;
    if (enExclusive.has(token)) enScore += 2;
  }

  if (enScore > esScore && enScore > ptScore) return 'en';
  if (esScore > ptScore) return 'es';
  if (ptScore > esScore) return 'pt';

  return 'pt';
}

/**
 * Detecta o nicho a partir do título do vídeo ou transcrição (multilíngue)
 */
function detectNiche(text = '') {
  const lower = text.toLowerCase();
  // Futebol / Esportes / Desempenho Atlético
  if (lower.includes('futebol') || lower.includes('futbol') || lower.includes('football') || lower.includes('soccer') ||
      lower.includes('futbolista') || lower.includes('jogador') || lower.includes('jugador') || lower.includes('cancha') ||
      lower.includes('pelota') || lower.includes('chute') || lower.includes('chuteira') || lower.includes('partido') ||
      lower.includes('futforce') || lower.includes('jogada') || lower.includes('pliometria')) {
    return 'futebol';
  }
  // Relacionamento / Conquista
  if (lower.includes('relaciona') || lower.includes('pareja') || lower.includes('homem') || lower.includes('hombre') ||
      lower.includes('mulher') || lower.includes('mujer') || lower.includes('namor') || lower.includes('novio') ||
      lower.includes('novia') || lower.includes('casal') || lower.includes('casamento') || lower.includes('matrimonio') ||
      lower.includes('conquista') || lower.includes('amor') || lower.includes('ex')) {
    return 'relacionamento';
  }
  // Emagrecimento / Dieta / Fitness Geral
  if (lower.includes('emagrec') || lower.includes('dieta') || lower.includes('peso') || lower.includes('gordura') ||
      lower.includes('grasa') || lower.includes('bajar de peso') || lower.includes('perder peso') || lower.includes('barriga') ||
      lower.includes('abdomen') || lower.includes('secar') || lower.includes('fit') || lower.includes('calorias') ||
      lower.includes('metabolismo') || lower.includes('adelgazar')) {
    return 'emagrecimento';
  }
  // Lei da Atração / Espiritualidade / Prosperidade
  if (lower.includes('atracao') || lower.includes('atração') || lower.includes('atraccion') || lower.includes('atracción') ||
      lower.includes('mente') || lower.includes('manifest') || lower.includes('universo') || lower.includes('espiritual') ||
      lower.includes('frequencia') || lower.includes('frecuencia') || lower.includes('vibra') || lower.includes('abundancia') ||
      lower.includes('prosperidad') || lower.includes('prosperidade')) {
    return 'lei_da_atracao';
  }
  // Renda Extra / Finanças / Vendas
  if (lower.includes('dinheiro') || lower.includes('dinero') || lower.includes('renda') || lower.includes('ingreso') ||
      lower.includes('conta') || lower.includes('cuenta') || lower.includes('financeir') || lower.includes('financier') ||
      lower.includes('salario') || lower.includes('sueldo') || lower.includes('lucro') || lower.includes('ganancia') ||
      lower.includes('venda') || lower.includes('venta') || lower.includes('invest') || lower.includes('invers') ||
      lower.includes('money') || lower.includes('salary')) {
    return 'renda_extra';
  }
  return 'geral';
}

const HEADLINES_BY_LANG_AND_NICHE = {
  // ESPANHOL (ES)
  es: {
    futebol: {
      dor_direta: "¿ENTRENAS DURO PERO NO SE NOTA EN LA CANCHA?",
      pergunta_paradoxal: "¿DE QUÉ SIRVE EL GIMNASIO SI NO SE NOTA EN LA CANCHA?",
      novidade: "LLEGÓ EL MÉTODO QUE ESTÁ TRANSFORMANDO A LOS FUTBOLISTAS",
      historia_pessoal: "ENTRENABA SIN ESTRUCTURA HASTA QUE ENTENDÍ ESTE ERROR",
      curiosidade: "EL SECRETO DE LOS PROS PARA AGUANTAR LOS 90 MINUTOS",
      the_one_thing: "AJUSTA ESTO EN TU ENTRENAMIENTO Y DOMINA EL PARTIDO",
      autoridade: "EL PROTOCOLO QUE PREPARADORES DE ÉLITE GUARDAN EN SECRETO",
      prova_social: "MILES DE FUTBOLISTAS YA MEJORARON SU RENDIMIENTO"
    },
    relacionamento: {
      dor_direta: "¿DIFICULTAD PARA RECUPERAR SU AMOR E INTERÉS?",
      pergunta_paradoxal: "NO NECESITAS ROGAR ATENCIÓN PARA TENERLA A TUS PIES",
      novidade: "LLEGÓ UNA FORMA TOTALMENTE NUEVA DE SALVAR TU RELACIÓN",
      historia_pessoal: "PERDÍ AL AMOR DE MI VIDA HASTA QUE ENTENDÍ ESTE ERROR",
      curiosidade: "EL TRUCO PSICOLÓGICO SIMPLE QUE CAMBIA CUALQUIER RELACIÓN",
      the_one_thing: "HAZ ESTA ÚNICA PREGUNTA Y NUNCA MÁS SUFRAS POR AMOR",
      autoridade: "EL MÉTODO QUE TERAPEUTAS DE PAREJA GUARDAN EN SECRETO",
      prova_social: "MÁS DE 8.000 PAREJAS YA SALVARON SU RELACIÓN CON ESTO"
    },
    emagrecimento: {
      dor_direta: "¿DIFICULTAD PARA QUEMAR LA GRASA LOCALIZADA?",
      pergunta_paradoxal: "NO NECESITAS PASAR HAMBRE PARA SECAR EL ABDOMEN",
      novidade: "LLEGÓ UN RITUAL MATUTINO QUE ACELERA LA QUEMA CELULAR",
      historia_pessoal: "PESABA 94KG Y PENSABA QUE MI METABOLISMO ERA LENTO",
      curiosidade: "EL TRUCO CASERO QUE HACE AL CUERPO QUEMAR GRASA DURMIENDO",
      the_one_thing: "AJUSTA ESTA ÚNICA COMIDA Y TU CUERPO EMPIEZA A SECAR",
      autoridade: "EL PROTOCOLO QUE MÉDICOS LLAMAN REVOLUCIÓN METABÓLICA",
      prova_social: "MÁS DE 12.000 PERSONAS YA SECARON SU ABDOMEN CON ESTO"
    },
    lei_da_atracao: {
      dor_direta: "¿DIFICULTAD PARA MANIFESTAR TUS MAYORES DESEOS?",
      pergunta_paradoxal: "NO NECESITAS ESFORZARTE MÁS PARA ATRAER ABUNDANCIA",
      novidade: "LA NUEVA FRECUENCIA QUE DESBLOQUEA PROSPERIDAD INMEDIATA",
      historia_pessoal: "VIVÍA EN LA ESCASEZ HASTA ENTENDER ESTA FRECUENCIA SECRETA",
      curiosidade: "EL CÓDIGO DE 3 MINUTOS QUE ATRAE DINERO INESPERADO",
      the_one_thing: "REPITE ESTA FRASE AL DESPERTAR Y MIRA TODO CAMBIAR",
      autoridade: "EL MÉTODO QUE FÍSICOS CUÁNTICOS LLAMAN LEY OCULTA",
      prova_social: "MILES DE PERSONAS YA DESTRABARON SU VIDA CON ESTA FRECUENCIA"
    },
    renda_extra: {
      dor_direta: "¿DIFICULTAD PARA QUE EL SUELDO ALCANCE A FIN DE MES?",
      pergunta_paradoxal: "NO NECESITAS GANAR MÁS PARA QUE TE SOBRE DINERO",
      novidade: "LLEGÓ UNA FORMA NUEVA Y AUTOMÁTICA DE ORGANIZAR TUS CUENTAS",
      historia_pessoal: "GANABA BIEN Y VIVÍA EN NÚMEROS ROJOS CADA MES",
      curiosidade: "EL TRUCO SIMPLE QUE HIZO RENDIR MI SUELDO TODO EL MES",
      the_one_thing: "HAZ ESTO 1 VEZ POR SEMANA Y TUS FINANZAS SE ORGANIZAN",
      autoridade: "EL MÉTODO QUE EXPERTOS LLAMAN EL FUTURO DE LAS FINANZAS",
      prova_social: "MILES DE PERSONAS YA ORGANIZARON SUS CUENTAS CON ESTO"
    },
    geral: {
      dor_direta: "¿CANSADO DE PERDER TIEMPO CON MÉTODOS QUE NO FUNCIONAN?",
      pergunta_paradoxal: "NO NECESITAS ESFORZARTE MÁS PARA TENER MÁS RESULTADOS",
      novidade: "LLEGÓ UNA FORMA TOTALMENTE NUEVA DE RESOLVER ESTO",
      historia_pessoal: "ME EQUIVOQUÉ DURANTE AÑOS HASTA DESCUBRIR ESTE SECRETO",
      curiosidade: "EL TRUCO SENCILLO QUE MUY POCOS SE ATREVEN A REVELAR",
      the_one_thing: "HAZ SOLO ESTA ÚNICA COSA Y NOTA LA DIFERENCIA",
      autoridade: "EL MÉTODO COMPROBADO POR LOS MAYORES EXPERTOS",
      prova_social: "MILES DE PERSONAS YA COMPROBARON LA EFICACIA DE ESTO"
    }
  },

  // PORTUGUÊS (PT)
  pt: {
    futebol: {
      dor_direta: "TREINANDO DURO MAS NÃO SE NOTA NO CAMPO?",
      pergunta_paradoxal: "VOCÊ NÃO PRECISA SE MATAR NA ACADEMIA PRA VOAR EM CAMPO",
      novidade: "CHEGOU O MÉTODO QUE ESTÁ TRANSFORMANDO JOGADORES",
      historia_pessoal: "EU TREINAVA SEM ESTRUTURA ATÉ ENTENDER ESSE ERRO BOBO",
      curiosidade: "O SEGREDO DOS ATLETAS PRO PRA AGUANTAR OS 90 MINUTOS",
      the_one_thing: "AJUSTE ISSO NO SEU TREINO E DOMINE QUALQUER PARTIDA",
      autoridade: "O PROTOCOLO QUE PREPARADORES DE ELITE GUARDAM A SETE CHAVES",
      prova_social: "MILHARES DE JOGADORES JÁ MELHORARAM SEU RENDIMENTO"
    },
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
  },

  // INGLÊS (EN)
  en: {
    futebol: {
      dor_direta: "TRAINING HARD BUT NOT SEEING IT ON THE PITCH?",
      pergunta_paradoxal: "YOU DON'T NEED TO EXHAUST YOURSELF TO DOMINATE THE MATCH",
      novidade: "THE NEW PROTOCOL TRANSFORMING SOCCER PLAYERS TODAY",
      historia_pessoal: "I TRAINED FOR YEARS UNTIL I FIXED THIS ONE SIMPLE MISTAKE",
      curiosidade: "THE PRO SECRET TO LASTING 90 FULL MINUTES AT MAX SPEED",
      the_one_thing: "ADJUST THIS ONE ROUTINE AND TRANSFORM YOUR GAME TODAY",
      autoridade: "THE TRAINING PROTOCOL PRO ATHLETIC TRAINERS KEEP SECRET",
      prova_social: "THOUSANDS OF PLAYERS ALREADY BOOSTED THEIR PERFORMANCE"
    },
    relacionamento: {
      dor_direta: "STRUGGLING TO RECONNECT WITH THE ONE YOU LOVE?",
      pergunta_paradoxal: "YOU DON'T NEED TO BEG FOR ATTENTION TO WIN HER HEART",
      novidade: "A BRAND NEW APPROACH TO SAVING RELATIONSHIPS IN CRISIS",
      historia_pessoal: "I LOST THE LOVE OF MY LIFE UNTIL I UNDERSTOOD THIS MISTAKE",
      curiosidade: "THE SIMPLE PSYCHOLOGICAL TRIGGER THAT CHANGES ANY RELATIONSHIP",
      the_one_thing: "ASK THIS ONE QUESTION AND NEVER SUFFER IN LOVE AGAIN",
      autoridade: "THE METHOD TOP COUPLES THERAPISTS KEEP BEHIND CLOSED DOORS",
      prova_social: "OVER 8,000 COUPLES HAVE ALREADY SAVED THEIR RELATIONSHIP"
    },
    emagrecimento: {
      dor_direta: "STRUGGLING TO BURN STUBBORN BELLY FAT?",
      pergunta_paradoxal: "YOU DON'T NEED TO STARVE TO GET A FLAT STOMACH",
      novidade: "THE MORNING RITUAL THAT ACCELERATES CELLULAR FAT BURN",
      historia_pessoal: "I WEIGHED 210 LBS UNTIL I DISCOVERED THIS HIDDEN METABOLIC TRICK",
      curiosidade: "THE SIMPLE BEDTIME TRICK THAT BURNS FAT WHILE YOU SLEEP",
      the_one_thing: "FIX THIS ONE MEAL AND YOUR BODY STARTS BURNING FAT",
      autoridade: "THE PROTOCOL DOCTORS CALL A METABOLIC BREAKTHROUGH",
      prova_social: "OVER 12,000 PEOPLE ALREADY TRANSFORMED WITH THIS METHOD"
    },
    lei_da_atracao: {
      dor_direta: "STRUGGLING TO MANIFEST YOUR DEEPEST GOALS?",
      pergunta_paradoxal: "YOU DON'T NEED TO STRUGGLE TO ATTRACT REAL ABUNDANCE",
      novidade: "THE HIDDEN FREQUENCY THAT UNLOCKS IMMEDIATE PROSPERITY",
      historia_pessoal: "I LIVED IN SCARCITY UNTIL I DISCOVERED THIS FREQUENCY",
      curiosidade: "THE 3-MINUTE CODE THAT ATTRACTS UNEXPECTED ABUNDANCE",
      the_one_thing: "REPEAT THIS ONE PHRASE EVERY MORNING AND WATCH WHAT HAPPENS",
      autoridade: "THE TECHNIQUE QUANTUM PHYSICISTS CALL THE HIDDEN LAW",
      prova_social: "THOUSANDS OF PEOPLE HAVE ALREADY UNLOCKED THEIR LIFE"
    },
    renda_extra: {
      dor_direta: "STRUGGLING TO MAKE YOUR MONEY LAST UNTIL MONTH'S END?",
      pergunta_paradoxal: "YOU DON'T NEED A BIGGER SALARY TO SAVE MORE MONEY",
      novidade: "THE AUTOMATED SYSTEM TO ORGANIZE YOUR FINANCES EFFORTLESSLY",
      historia_pessoal: "I EARNED GOOD MONEY BUT WAS BROKE EVERY SINGLE MONTH",
      curiosidade: "THE SIMPLE HABIT THAT MADE MY INCOME LAST ALL MONTH LONG",
      the_one_thing: "DO THIS ONCE A WEEK AND YOUR ACCOUNTS STAY BALANCED",
      autoridade: "THE FINANCIAL SYSTEM EXPERTS CALL THE FUTURE OF WEALTH",
      prova_social: "THOUSANDS HAVE ALREADY TAKEN CONTROL OF THEIR MONEY"
    },
    geral: {
      dor_direta: "TIRED OF WASTING TIME ON METHODS THAT NEVER WORK?",
      pergunta_paradoxal: "YOU DON'T NEED TO WORK HARDER TO GET BETTER RESULTS",
      novidade: "A COMPLETELY NEW WAY TO SOLVE THIS ONCE AND FOR ALL",
      historia_pessoal: "I STRUGGLED FOR YEARS UNTIL I DISCOVERED THIS SECRET",
      curiosidade: "THE SIMPLE TRUTH THAT VERY FEW EXPERTS ARE WILLING TO SHARE",
      the_one_thing: "DO THIS ONE THING AND NOTICE THE DIFFERENCE IMMEDIATELY",
      autoridade: "THE PROVEN FRAMEWORK BACKED BY TOP INDUSTRY LEADERS",
      prova_social: "THOUSANDS OF PEOPLE HAVE ALREADY VERIFIED THESE RESULTS"
    }
  }
};

// Aliases para compatibilidade retroativa
const HEADLINES_BY_NICHE_AND_ANGLE = HEADLINES_BY_LANG_AND_NICHE.pt;

/**
 * Obtém a headline de fallback exata considerando idioma, nicho e ângulo
 */
function getFallbackHeadline(lang = 'pt', niche = 'geral', angle = 'pergunta_paradoxal') {
  const normLang = (lang === 'es' || lang === 'en') ? lang : 'pt';
  const langBank = HEADLINES_BY_LANG_AND_NICHE[normLang] || HEADLINES_BY_LANG_AND_NICHE.pt;
  const nicheMap = langBank[niche] || langBank.geral;
  
  // Normalizar ângulo
  let normAngle = (angle || 'pergunta_paradoxal').replace(/-/g, '_');
  if (normAngle === 'one_thing') normAngle = 'the_one_thing';
  if (normAngle === 'gancho_curto') normAngle = 'dor_direta';

  return nicheMap[normAngle] || nicheMap.pergunta_paradoxal || nicheMap.dor_direta;
}

async function generateHeadlineAI({ transcriptText, videoTitle, angle = 'pergunta_paradoxal' }) {
  const combinedContext = `${videoTitle || ''} ${transcriptText || ''}`.trim();
  const lang = detectLanguage(combinedContext);
  const niche = detectNiche(combinedContext);
  const settings = getSettings();

  const langNames = {
    es: 'Espanhol (Español)',
    pt: 'Português (Portuguese)',
    en: 'Inglês (English)'
  };
  const langName = langNames[lang] || 'Espanhol/Português';
  
  if (settings.geminiApiKey || settings.openRouterApiKey) {
    try {
      const prompt = `
Você é o estrategista de copy Direct Response para anúncios de tráfego pago de altíssima conversão.
CONTEXTO DO ANÚNCIO:
- Tema / Roteiro da fala: "${combinedContext}"
- Nicho detectado: "${niche}"
- Ângulo de abordagem: "${angle}" (ex: dor direta, pergunta paradoxal, novidade, história pessoal, curiosidade, the one thing, autoridade, prova social).
- IDIOMA OBRIGATÓRIO: "${langName}" (${lang.toUpperCase()})

*** REGRA CRÍTICA DE IDIOMA ***
O áudio/copy deste vídeo está falado em ${langName}.
A HEADLINE DEVE OBRIGATORIAMENTE ESTAR NO MESMO IDIOMA (${langName}).
- Se o roteiro for em ESPANHOL (${lang === 'es' ? 'COMO É O CASO DESTE VÍDEO' : ''}), a headline DEVE ser 100% em ESPANHOL (ex: "¿ENTRENAS DURO PERO NO SE NOTA EN LA CANCHA?"). NUNCA gere em português!
- Se o roteiro for em PORTUGUÊS, a headline DEVE ser em Português.
- Se o roteiro for em INGLÊS, a headline DEVE ser em Inglês.

REQUISITOS DA HEADLINE:
1. Máximo 10 palavras.
2. TOTALMENTE EM CAIXA ALTA (MAIÚSCULAS).
3. Sem aspas ou emojis.
4. Gancho ultra-agressivo para os primeiros 3 segundos de retenção de criativo pago.
5. 100% sobre o nicho "${niche}" e coerente com as palavras da transcrição.

Responda APENAS em JSON:
{
  "headline": "TEXTO DA HEADLINE NO IDIOMA ${lang.toUpperCase()}"
}
`;
      let aiResult;
      if (settings.geminiApiKey) {
        aiResult = await callGemini(prompt, settings.geminiApiKey);
      } else {
        aiResult = await callOpenRouter(prompt, settings.openRouterApiKey);
      }
      if (aiResult?.headline) {
        return aiResult.headline.trim().toUpperCase();
      }
    } catch (err) {
      console.warn('[Headline AI] Fallback to localized niche templates:', err.message);
    }
  }

  // Fallback baseado no idioma e nicho exatos
  return getFallbackHeadline(lang, niche, angle);
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
  // Corte seco, Fade, Flash branco, Zoom punch, Whip lateral, Blur, Glitch, Glare
  const transitionTypes = ['zoom_punch', 'corte_seco', 'whip_lateral', 'flash_branco', 'fade', 'blur', 'glitch', 'glare'];
  const transitionDefaultSound = {
    corte_seco: 'padrao',
    fade: 'swoosh',
    flash_branco: 'camera_flash',
    zoom_punch: 'impact_sub',
    whip_lateral: 'whip_snap',
    blur: 'whoosh_deep',
    glitch: 'glitch_sfx',
    glare: 'optic_glare',
    flare: 'optic_glare'
  };
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
        sound: transitionDefaultSound[transitionType] || 'padrao',
        volume: 80
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

  const contextStr = `${videoTitle || ''} ${transcript?.text || ''}`;
  const lang = detectLanguage(contextStr);
  const niche = detectNiche(contextStr);
  const fallbackHeadline = getFallbackHeadline(lang, niche, 'pergunta_paradoxal');

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

  const contextStr = `${videoTitle || ''} ${transcript?.text || ''}`;
  const lang = detectLanguage(contextStr);
  const niche = detectNiche(contextStr);
  const langNames = {
    es: 'Espanhol (Español)',
    pt: 'Português (Portuguese)',
    en: 'Inglês (English)'
  };
  const langName = langNames[lang] || 'Espanhol/Português';

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
- Nicho detectado: "${niche}"
- IDIOMA OBRIGATÓRIO: "${langName}" (${lang.toUpperCase()})
- B-rolls disponíveis: ${JSON.stringify(brollSummary)}

*** REGRA CRÍTICA DE IDIOMA ***
O vídeo está falado em ${langName}.
A HEADLINE DEVE OBRIGATORIAMENTE ESTAR NO MESMO IDIOMA (${langName}).
- Se o roteiro for em ESPANHOL, a headline DEVE ser 100% em ESPANHOL (ex: "¿ENTRENAS DURO PERO NO SE NOTA EN LA CANCHA?"). NUNCA gere em português!
- Se o roteiro for em PORTUGUÊS, a headline DEVE ser em Português.
- Se o roteiro for em INGLÊS, a headline DEVE ser em Inglês.

REQUISITOS OBRIGATÓRIOS:
1. "headline": Headline agressiva Direct Response em CAIXA ALTA (máximo 10 palavras), 100% coerente com o tema E NO MESMO IDIOMA DA TRANSCRIÇÃO (${langName}).
2. "scenes": Divida o vídeo em cenas contíguas cobrindo de 0.0 até exatamente ${duration} segundos (cada cena entre 2.5s e 4.5s de duração).
   - Cena 1 DEVE ser "dividida" (Hook com B-roll e Avatar).
   - As demais cenas alternam dinamicamente entre "avatar", "broll" e "dividida".
   - Para cada cena, escolha o "brollFilename" mais pertinente da lista de B-rolls fornecida.
   - Indique "zoom": "sem_efeito", "zoom_in", "zoom_out" ou "zoom_punch".
   - Indique "transition": "corte_seco", "fade", "flash_branco", "zoom_punch", "whip_lateral", "blur", "glitch" ou "flare".

Responda APENAS em JSON no formato:
{
  "headline": "TEXTO DA HEADLINE NO IDIOMA ${lang.toUpperCase()}",
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
  const contextStr = `${videoTitle || ''} ${transcript?.text || ''}`;
  const lang = detectLanguage(contextStr);
  const niche = detectNiche(contextStr);
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
            sound: transitionDefaultSound[raw.transition] || 'impact_sub',
            volume: 80
          },
          texture: { grain: i % 4 === 0, flash: false },
          subtitlePosition: 'automatica',
          text: sceneText,
          label: `Cena ${i + 1}: ${raw.displayMode === 'dividida' ? 'Tela Dividida' : raw.displayMode === 'broll' ? 'B-Roll' : 'Avatar'}`
        });
      }

      if (validatedScenes.length >= 3) {
        const fallbackHL = getFallbackHeadline(lang, niche, headlineType);
        plan = {
          headline: {
            text: (aiPlan.headline && aiPlan.headline.trim()) ? aiPlan.headline.trim().toUpperCase() : fallbackHL,
            style: 'block',
            bgColor: '#dc2626',
            textColor: '#ffffff',
            position: 'avatar'
          },
          broll_segments: validatedScenes
        };
        console.log('[OpenRouter AI] Plano de edição montado com sucesso! Cenas:', validatedScenes.length, 'Idioma:', lang);
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
  detectLanguage,
  detectNiche,
  getFallbackHeadline,
  HEADLINES_BY_LANG_AND_NICHE,
  HEADLINES_BY_NICHE_AND_ANGLE
};
