import React, { useState, useMemo, useRef } from 'react';
import {
  Video,
  Music2,
  Folder,
  Check,
  Sparkles,
  Upload,
  X,
  FileAudio,
  Plus,
  ArrowLeft,
  Home,
  ChevronRight
} from 'lucide-react';

const API_BASE = 'http://localhost:3001';

const FORMATS = [
  {
    id: '9:16',
    name: '9:16',
    label: 'Vertical',
    desc: 'Reels, TikTok, Shorts e Stories',
    iconType: 'phone'
  },
  {
    id: '16:9',
    name: '16:9',
    label: 'Horizontal',
    desc: 'YouTube, sites e TV',
    iconType: 'monitor'
  },
  {
    id: '1:1',
    name: '1:1',
    label: 'Quadrado',
    desc: 'Feed do Instagram e do Facebook',
    iconType: 'square'
  },
  {
    id: '4:3',
    name: '4:3',
    label: 'Clássico',
    desc: 'Feed horizontal e telas 4:3',
    iconType: 'classic'
  },
  {
    id: '3:4',
    name: '3:4',
    label: 'Retrato',
    desc: 'Feed do Instagram em retrato',
    iconType: 'portrait'
  },
  {
    id: '2:1',
    name: '2:1',
    label: 'Panorâmico',
    desc: 'Banners, LinkedIn e X',
    iconType: 'panoramic'
  }
];

// Exactly 7 templates for Ads (as shown in the real VibeCut screenshot)
const AD_TEMPLATES = [
  {
    id: 'direct-response',
    name: 'Direct Response',
    tagline: 'Hook denso + argumento que converte',
    description: 'O padrão clássico de resposta direta: mudança visual a cada ~3s no hook para segurar a atenção, ritmo mais calmo no corpo (4–6s) e b-rolls escolhidos pelo que está sendo falado.'
  },
  {
    id: 'motion',
    name: 'Movement',
    tagline: 'Movimento contínuo, ritmo de batida',
    description: 'Nada fica parado: todo segmento tem zoom animado (inclusive os b-rolls em tela cheia), cortes curtos e uniformes como numa batida musical, e fades rápidos nas trocas de contexto.'
  },
  {
    id: 'talking-head-minimal',
    name: 'Talking Head',
    tagline: 'Avatar em foco, cortes de zoom e transições',
    description: 'O avatar carrega o anúncio sozinho (85–95% do tempo). A cada frase a câmera corta para um enquadramento mais fechado e volta, e cada troca de assunto entra com uma transição (zoom punch, glare, flash, blur ou whip). B-roll é exceção: no máximo 2 cenas, só com prova muito forte. Ideal para autoridade e argumento.'
  },
  {
    id: 'voice-over',
    name: 'Voice-over',
    tagline: 'Só a voz + b-rolls, zero cara de ad',
    description: 'O avatar nunca aparece: a voz dele narra sobre 100% b-roll, como conteúdo orgânico/documentário. Ideal quando os b-rolls são fortes e o rosto não é o ativo principal.'
  },
  {
    id: 'green-screen',
    name: 'Green Screen',
    tagline: 'Avatar recortado sobre b-roll, sempre na lateral',
    description: 'Toda cena tem o avatar recortado por IA sobre o b-roll, ocupando pouco mais da metade da altura e jogado para a esquerda ou a direita por sorteio. Nunca no centro, nunca sem recorte: o fundo troca a cada cena e a pessoa nunca sai da tela.'
  },
  {
    id: 'caixinha-pergunta',
    name: 'Caixinha de pergunta',
    tagline: 'A caixinha do Instagram na tela o vídeo todo',
    description: 'Você responde uma pergunta e ela fica na tela do começo ao fim, na caixinha do Instagram. A edição vem crua, sem efeito nem som de transição, dividida em cenas para você mexer à vontade.'
  },
  {
    id: 'destaques',
    name: 'Letters',
    tagline: 'Palavras-chave grandes no topo, checklist e som',
    description: 'Câmera parada e a energia toda nas camadas: as palavras que carregam a promessa aparecem grandes no topo no instante em que são faladas, benefícios enumerados viram checklist com fundo escurecido, e cada entrada tem um som curto. A legenda some enquanto o texto está na tela.',
    fullWidth: true
  }
];

const HEADLINE_ANGLES_DEF = [
  { id: 'dor-direta', name: 'Dor direta', defaultEx: '“Dificuldade pra pagar o aluguel?”' },
  { id: 'pergunta-paradoxal', name: 'Pergunta paradoxal', defaultEx: '“Você não precisa ganhar mais pra sobrar dinheiro”' },
  { id: 'novidade', name: 'Novidade', defaultEx: '“Chegou um jeito novo de organizar as contas”' },
  { id: 'historia-pessoal', name: 'História pessoal', defaultEx: '“Eu ganhava bem. E vivia no vermelho.”' },
  { id: 'curiosidade', name: 'Curiosidade', defaultEx: '“O truque bobo que fez meu salário render o mês inteiro”' },
  { id: 'one-thing', name: 'The One Thing', defaultEx: '“Faça isso 1x por semana e as contas se organizam”' },
  { id: 'autoridade', name: 'Autoridade', defaultEx: '“O método que especialistas chamam de futuro das finanças”' },
  { id: 'prova-social', name: 'Prova social', defaultEx: '“Milhares de brasileiros já organizaram as contas assim”' }
];

const NICHE_HOOKS = {
  futebol: {
    'dor-direta': 'Entrenas duro pero no se nota en la cancha?',
    'pergunta-paradoxal': '¿De qué sirve el gimnasio si no se nota en tu fútbol?',
    'novidade': 'Llegó el método que está transformando a futbolistas',
    'historia-pessoal': 'Entrenaba sin estructura hasta que descubrí este error',
    'curiosidade': 'El secreto de los pros para aguantar los 90 minutos',
    'one-thing': 'Ajusta esto en tu rutina y mejora tu fútbol hoy',
    'autoridade': 'El protocolo que preparadores de élite guardan en secreto',
    'prova-social': 'Miles de futbolistas ya mejoraron su rendimiento'
  },
  relacionamento: {
    'dor-direta': 'Dificuldade pra reconquistar o amor dela?',
    'pergunta-paradoxal': 'Você não precisa implorar atenção pra ter ela aos seus pés',
    'novidade': 'Chegou um jeito novo de salvar relacionamentos em crise',
    'historia-pessoal': 'Eu perdi o amor da minha vida até entender esse erro bobo',
    'curiosidade': 'O truque psicológico simples que muda qualquer relação',
    'one-thing': 'Faça essa única pergunta e nunca mais sofra por amor',
    'autoridade': 'O método que terapeutas de casais guardam a sete chaves',
    'prova-social': 'Mais de 8.000 casais já salvaram a relação com este padrão'
  },
  emagrecimento: {
    'dor-direta': 'Dificuldade pra queimar a gordura localizada?',
    'pergunta-paradoxal': 'Você não precisa passar fome pra secar a barriga',
    'novidade': 'Chegou um ritual matinal que acelera a queima celular',
    'historia-pessoal': 'Eu pesava 94kg e achava que meu metabolismo era lento',
    'curiosidade': 'O truque caseiro que faz o corpo queimar gordura dormindo',
    'one-thing': 'Ajuste essa única refeição e seu corpo começa a secar',
    'autoridade': 'O protocolo que médicos chamam de revolução metabólica',
    'prova-social': 'Mais de 12.000 pessoas já secaram a barriga com essa técnica'
  },
  lei_da_atracao: {
    'dor-direta': 'Dificuldade pra manifestar seus maiores sonhos?',
    'pergunta-paradoxal': 'Você não precisa se esforçar mais pra atrair abundância',
    'novidade': 'A nova frequência que desbloqueia a prosperidade imediata',
    'historia-pessoal': 'Eu vivia na escassez até entender essa frequência oculta',
    'curiosidade': 'O código de 3 minutos que atrai dinheiro inesperado',
    'one-thing': 'Repita essa frase 1x ao acordar e veja tudo mudar',
    'autoridade': 'O método que físicos quânticos chamam de lei oculta',
    'prova-social': 'Milhares de pessoas já destravaram a vida com essa frequência'
  },
  renda_extra: {
    'dor-direta': 'Dificuldade pra fazer o salário sobrar no final do mês?',
    'pergunta-paradoxal': 'Você não precisa ganhar mais pra sobrar dinheiro',
    'novidade': 'Chegou um jeito novo e automático de organizar as contas',
    'historia-pessoal': 'Eu ganhava bem e vivia no vermelho todo santo mês',
    'curiosidade': 'O truque bobo que fez meu salário render o mês inteiro',
    'one-thing': 'Faça isso 1x por semana e as contas se organizam',
    'autoridade': 'O método que especialistas chamam de futuro das finanças',
    'prova-social': 'Milhares de brasileiros já organizaram as contas assim'
  },
  geral: {
    'dor-direta': 'Dificuldade pra pagar o aluguel?',
    'pergunta-paradoxal': 'Você não precisa ganhar mais pra sobrar dinheiro',
    'novidade': 'Chegou um jeito novo de organizar as contas',
    'historia-pessoal': 'Eu ganhava bem. E vivia no vermelho.',
    'curiosidade': 'O truque bobo que fez meu salário render o mês inteiro',
    'one-thing': 'Faça isso 1x por semana e as contas se organizam',
    'autoridade': 'O método que especialistas chamam de futuro das finanças',
    'prova-social': 'Milhares de brasileiros já organizaram as contas assim'
  }
};

const SUBTITLE_PRESETS = [
  { id: 'impacto', name: 'Impacto', preview: 'ISSO MUDA TUDO', color: '#FFE600', uppercase: true, font: 'Anton' },
  { id: 'destaque-verde', name: 'Destaque Verde', preview: 'RESULTADO REAL', color: '#8CFF00', uppercase: true, font: 'Archivo Black' },
  { id: 'karaoke', name: 'Karaokê', preview: 'EU DESCOBRI O SEGREDO', activeWord: 'SEGREDO', color: '#FFD400', font: 'Archivo Black' },
  { id: 'tarja', name: 'Tarja Escura', preview: 'o segredo é a manteiga', badge: true, font: 'Poppins' },
  { id: 'pilula', name: 'Pílula Branca', preview: 'pronta em 5 minutos', pill: true, font: 'Poppins' },
  { id: 'neon', name: 'Neon Glow', preview: 'SEM FILTRO', neon: true, font: 'Bebas Neue' },
  { id: 'minimal', name: 'Minimal', preview: 'O resultado me surpreendeu', minimal: true, font: 'Poppins' },
  { id: 'comic', name: 'Comic Pop', preview: 'OLHA ISSO AQUI!', comic: true, font: 'Bangers' },
  { id: 'caixa', name: 'Palavra em Caixa', preview: 'O INTESTINO FERMENTANDO', boxWord: 'FERMENTANDO', font: 'Archivo Black' },
  { id: 'sublinhado', name: 'Sublinhado', preview: 'resultado em 7 dias', underline: true, font: 'Poppins' },
  { id: 'documentario', name: 'Documentário', preview: 'o corpo responde em dias', serif: true, font: 'PT Serif' },
  { id: 'maquina', name: 'Máquina de Escrever', preview: 'o que ninguém te conta_', mono: true, font: 'Courier Prime' },
  { id: 'foco', name: 'Foco', preview: 'déficit', focusPill: true, font: 'Poppins' },
  { id: 'manchete', name: 'Manchete', preview: 'O CORPO RESPONDE', giantWord: 'RESPONDE', font: 'Alfa Slab One' },
  { id: 'sombra-dura', name: 'Sombra Dura', preview: 'ANTES E DEPOIS', shadowDura: true, font: 'Alfa Slab One' },
  { id: 'bloco', name: 'Bloco', preview: 'NA SMASH PONG', pinkBlock: true, font: 'Archivo Black' },
  { id: 'palavra', name: 'Uma Palavra', preview: 'paraguai', italicWord: true, font: 'Poppins' }
];

export default function CreateAdView({
  categories = [],
  onProjectCreated,
  isVslMode = false,
  currentTheme = 'indigo',
  onNavigateToLibrary,
  onBackToList
}) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoName, setVideoName] = useState('');
  const [removeSilences, setRemoveSilences] = useState(false);

  // Format selection
  const [selectedFormat, setSelectedFormat] = useState('9:16');

  // Template selection (only for Ad mode)
  const [selectedTemplate, setSelectedTemplate] = useState('direct-response');

  // Caixinha de pergunta state
  const [caixinhaTitulo, setCaixinhaTitulo] = useState('Consultoria gratuita');
  const [caixinhaPergunta, setCaixinhaPergunta] = useState('Como passar do teto de faturamento?');

  // Headline state: 'auto', 'angle', 'none'
  const [headlineMode, setHeadlineMode] = useState(isVslMode ? 'none' : 'angle');
  const [selectedAngle, setSelectedAngle] = useState('dor-direta');

  // Subtitle state
  const [enableSubtitles, setEnableSubtitles] = useState(true);
  const [selectedSubtitle, setSelectedSubtitle] = useState('impacto');
  const [highlightColor, setHighlightColor] = useState('#FFE600');
  const [fontScale, setFontScale] = useState(100);

  // Background music file upload state (as in Image 2, user drops/uploads audio file)
  const [musicFile, setMusicFile] = useState(null);
  const musicInputRef = useRef(null);

  // B-roll Categories selection
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');

  // Niche detection based on video title / uploaded product
  const detectedNiche = useMemo(() => {
    const lower = (videoName || '').toLowerCase();
    if (lower.includes('futebol') || lower.includes('futbol') || lower.includes('football') || lower.includes('soccer') || lower.includes('futbolista') || lower.includes('jogador') || lower.includes('jugador') || lower.includes('cancha') || lower.includes('partido') || lower.includes('futforce')) {
      return 'futebol';
    }
    if (lower.includes('relaciona') || lower.includes('homem') || lower.includes('mulher') || lower.includes('namor') || lower.includes('casal') || lower.includes('casamento') || lower.includes('amor')) {
      return 'relacionamento';
    }
    if (lower.includes('emagrec') || lower.includes('dieta') || lower.includes('peso') || lower.includes('gordura') || lower.includes('barriga') || lower.includes('secar') || lower.includes('fit')) {
      return 'emagrecimento';
    }
    if (lower.includes('atracao') || lower.includes('atração') || lower.includes('mente') || lower.includes('manifest') || lower.includes('espiritual')) {
      return 'lei_da_atracao';
    }
    if (lower.includes('dinheiro') || lower.includes('renda') || lower.includes('conta') || lower.includes('finan') || lower.includes('salario') || lower.includes('venda')) {
      return 'renda_extra';
    }
    return 'geral';
  }, [videoName]);

  const currentNicheHooks = NICHE_HOOKS[detectedNiche] || NICHE_HOOKS.geral;

  const totalBrolls = useMemo(() => {
    return categories.reduce((acc, cat) => acc + (cat.count || 0), 0);
  }, [categories]);

  const totalSelectedVideos = useMemo(() => {
    return categories
      .filter(c => selectedCategories.includes(c.id))
      .reduce((acc, c) => acc + (c.count || 0), 0);
  }, [categories, selectedCategories]);

  const toggleCategory = (catId) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setVideoName(cleanName);
    }
  };

  const handleMusicChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMusicFile(file);
    }
  };

  const handleStartAnalysis = async () => {
    if (!videoFile) {
      alert(isVslMode ? 'Por favor, selecione ou arraste o vídeo completo da VSL.' : 'Por favor, selecione ou arraste o vídeo do avatar.');
      return;
    }
    if (categories.length > 0 && selectedCategories.length === 0) {
      alert('Selecione pelo menos uma categoria de B-roll na coluna da direita.');
      return;
    }

    setIsProcessing(true);
    setProgressText('Transcrevendo áudio com timestamps por palavra...');

    try {
      const formData = new FormData();
      formData.append('title', videoName || videoFile.name.replace(/\.[^/.]+$/, ''));
      formData.append('template', isVslMode ? 'vsl' : selectedTemplate);
      formData.append('format', selectedFormat);
      formData.append('headlineMode', isVslMode ? 'sem_headline' : (headlineMode === 'angle' ? 'escolher_angulo' : headlineMode === 'auto' ? 'automatica' : 'sem_headline'));
      formData.append('headlineType', selectedAngle);
      formData.append('subtitleStyle', enableSubtitles ? selectedSubtitle : '');
      formData.append('highlightColor', highlightColor);
      formData.append('fontScale', fontScale.toString());
      formData.append('removeSilences', String(removeSilences));
      formData.append('categories', JSON.stringify(selectedCategories));
      formData.append('isVslMode', isVslMode ? 'true' : 'false');

      if (selectedTemplate === 'caixinha-pergunta') {
        formData.append('caixinhaTitulo', caixinhaTitulo);
        formData.append('caixinhaPergunta', caixinhaPergunta);
      }

      if (musicFile) {
        formData.append('music', musicFile);
      }

      formData.append('videos', videoFile);

      setTimeout(() => setProgressText('Identificando tópicos e sincronizando B-rolls...'), 1400);
      setTimeout(() => setProgressText('Calculando cortes dinâmicos e ritmo da narração...'), 2800);

      const res = await fetch(`${API_BASE}/api/projects/create`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao processar');
      }

      const data = await res.json();
      if (data.projects && data.projects.length > 0) {
        if (onBackToList) {
          onBackToList();
        } else if (onProjectCreated) {
          onProjectCreated(data.projects[0], data.projects);
        }
      }
    } catch (err) {
      alert('Falha na criação: ' + err.message);
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const selectedPresetObj = SUBTITLE_PRESETS.find(s => s.id === selectedSubtitle);

  return (
    <div className="w-full p-6 sm:p-8 space-y-6 select-none font-sans">
      {/* Breadcrumb Navigation (Exact VibeCut match) */}
      <div className="flex items-center gap-2 text-sm text-[#92978F]">
        <button
          type="button"
          onClick={onBackToList}
          className="flex items-center hover:text-[#F5F5F0] transition-colors cursor-pointer"
          title="Início"
        >
          <Home className="w-4 h-4" />
        </button>
        <span className="text-xs text-[#92978F]">&gt;</span>
        <button
          type="button"
          onClick={onBackToList}
          className="hover:text-[#F5F5F0] transition-colors cursor-pointer"
        >
          {isVslMode ? 'Editor de VSL' : 'Editor de Anúncios'}
        </button>
        <span className="text-xs text-[#92978F]">&gt;</span>
        <span className="text-[#F5F5F0] font-medium">Novo</span>
      </div>

      {/* Page Title & Subtitle */}
      <div className="space-y-1 mb-2">
        <h1 className="text-xl font-semibold text-[#F5F5F0] tracking-tight">
          {isVslMode ? 'Nova VSL' : 'Novo anúncio'}
        </h1>
        <p className="text-sm text-[#92978F]">
          {isVslMode
            ? 'Envie o vídeo completo da VSL e escolha os b-rolls — a IA monta o plano de edição para você revisar'
            : 'Envie o vídeo do avatar e escolha os b-rolls — a IA monta o plano de edição para você revisar'}
        </p>
      </div>

      {/* 2-Columns Grid Layout: Exactly 50% / 50% split matching VibeCut reference */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: Inputs & Settings */}
        <div className="space-y-6">

          {/* CARD 1: Vídeo(s) do avatar / Vídeo da VSL */}
          <div className="bg-[#15181c] rounded-xl border border-[#21252b] p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#F5F5F0]">
                {isVslMode ? 'Vídeo da VSL' : 'Vídeo(s) do avatar'}
              </h2>
              <p className="text-sm text-[#92978F] mt-1 leading-relaxed">
                {isVslMode
                  ? 'Envie a VSL completa. O plano segue a fala, com b-rolls e frases em destaque.'
                  : (
                    <>
                      Envie um ou vários vídeos, cada arquivo vira um anúncio, nomeado pelo próprio nome do arquivo (ex.: <span className="font-mono text-[#F5F5F0]">N821.mp4</span> → anúncio <span className="font-mono text-[#F5F5F0]">N821</span>).
                    </>
                  )}
              </p>
            </div>

            {/* Drag & Drop Area */}
            {videoFile ? (
              <div className="border border-dashed border-[#C5F955]/60 bg-[#C5F955]/10 rounded-xl p-6 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-[#C5F955]/20 text-[#C5F955] flex items-center justify-center mb-2">
                  <Video className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-[#F5F5F0]">{videoFile.name}</span>
                <span className="text-xs text-[#C5F955] mt-0.5 font-medium">Arquivo pronto para análise</span>
                <button
                  type="button"
                  onClick={() => {
                    setVideoFile(null);
                    setVideoName('');
                  }}
                  className="mt-3 text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Substituir vídeo
                </button>
              </div>
            ) : (
              <label className="border border-[#21252b] hover:border-[#2f353d] bg-[#111315] rounded-xl py-6 px-4 flex flex-col items-center justify-center cursor-pointer transition-colors block text-center">
                <input
                  type="file"
                  accept={isVslMode ? 'video/mp4,video/quicktime,video/webm' : 'video/mp4,video/quicktime,video/webm,audio/mpeg,audio/mp3'}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-xl bg-[#15181c] border border-[#21252b] text-[#92978F] flex items-center justify-center mb-2.5">
                  <Video className="w-5 h-5 stroke-[1.8]" />
                </div>
                <span className="text-xs font-semibold text-[#F5F5F0]">
                  {isVslMode ? 'Arraste o vídeo completo da VSL' : 'Arraste o(s) vídeo(s) do avatar falando a copy'}
                </span>
                <span className="text-[11px] text-[#92978F] mt-1">
                  {isVslMode
                    ? 'MP4, MOV ou WebM · máximo 3 GB e 60 minutos'
                    : 'MP4, MOV, WebM ou MP3 · máximo 1 GB e 3 min cada · até 20 arquivos por vez'}
                </span>
              </label>
            )}

            {/* Checkbox: Remover pausas sem fala */}
            <label className="flex items-start gap-3 rounded-xl border border-[#21252b] bg-[#111315] p-3.5 cursor-pointer hover:border-[#2f353d] transition-colors">
              <input
                type="checkbox"
                checked={removeSilences}
                onChange={e => setRemoveSilences(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#C5F955] accent-[#C5F955] cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-[#F5F5F0] block">Remover pausas sem fala</span>
                <p className="text-xs text-[#92978F] leading-relaxed">
                  Corta momentos de silêncio do vídeo ou MP3 para deixar a narração mais fluida. Pausas curtas são preservadas. Vale para todos os arquivos deste envio.
                </p>
              </div>
            </label>
          </div>

          {/* CARD 2: Nome do anúncio / Nome da VSL */}
          <div className="bg-[#15181c] rounded-xl border border-[#21252b] p-6 space-y-3">
            <h2 className="text-sm font-semibold text-[#F5F5F0]">
              {isVslMode ? 'Nome da VSL' : 'Nome do anúncio'}
            </h2>
            <input
              type="text"
              value={videoName}
              onChange={e => setVideoName(e.target.value)}
              placeholder="Preenchido com o nome do arquivo ao enviar o vídeo — pode editar"
              className="w-full px-4 py-2.5 rounded-xl border border-[#21252b] text-sm text-[#F5F5F0] bg-[#111315] placeholder:text-[#92978F]/60 focus:outline-none focus:border-[#C5F955] transition-colors font-normal"
            />
          </div>

          {/* CARD 3: Template de edição (ONLY FOR ADS - Image 3 & 4. Hidden in VSL!) */}
          {!isVslMode && (
            <div className="bg-[#15181c] rounded-xl border border-[#21252b] p-6 space-y-3">
              <h2 className="text-sm font-semibold text-[#F5F5F0]">Template de edição</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AD_TEMPLATES.map(tpl => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                        tpl.fullWidth ? 'sm:col-span-2' : ''
                      } ${
                        isSelected
                          ? 'border-[#C5F955] bg-[#C5F955]/10 ring-1 ring-[#C5F955]'
                          : 'border-[#21252b] hover:border-[#2f353d] bg-[#111315]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-[#F5F5F0]">{tpl.name}</h3>
                          {isSelected && <Check className="w-4 h-4 text-[#C5F955]" />}
                        </div>
                        <p className={`text-xs mt-0.5 mb-1.5 ${isSelected ? 'text-[#C5F955]' : 'text-[#C5F955]/80'}`}>
                          {tpl.tagline}
                        </p>
                        <p className="text-xs text-[#92978F] leading-relaxed font-normal">
                          {tpl.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Caixinha de Pergunta Config when 'caixinha-pergunta' template selected */}
              {selectedTemplate === 'caixinha-pergunta' && (
                <div className="mt-4 pt-4 border-t border-[#21252b] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C5F955]" />
                    <span className="text-sm font-medium text-[#F5F5F0]">Caixinha do Instagram</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-7 space-y-2.5">
                      <div>
                        <label className="text-xs text-[#92978F] block mb-1">Título da caixinha</label>
                        <input
                          type="text"
                          maxLength={40}
                          value={caixinhaTitulo}
                          onChange={e => setCaixinhaTitulo(e.target.value)}
                          placeholder="Consultoria gratuita"
                          className="w-full px-3 py-2 rounded-lg border border-[#21252b] text-xs text-[#F5F5F0] bg-[#111315] focus:outline-none focus:border-[#C5F955]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#92978F] block mb-1">Pergunta</label>
                        <textarea
                          rows={2}
                          maxLength={180}
                          value={caixinhaPergunta}
                          onChange={e => setCaixinhaPergunta(e.target.value)}
                          placeholder="Como passar do teto de faturamento?"
                          className="w-full px-3 py-2 rounded-lg border border-[#21252b] text-xs text-[#F5F5F0] bg-[#111315] focus:outline-none focus:border-[#C5F955] resize-none"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-[#0e1012] rounded-xl border border-[#21252b]">
                      <div className="w-48 rounded-xl overflow-hidden shadow-lg border border-white/10 font-sans">
                        <div className="bg-[#24292e] px-3 py-1.5 text-center">
                          <span className="text-xs font-medium text-[#F5F5F0] tracking-tight line-clamp-1">
                            {caixinhaTitulo || 'Consultoria gratuita'}
                          </span>
                        </div>
                        <div className="bg-white px-3 py-2.5 text-center min-h-[46px] flex items-center justify-center">
                          <p className="text-xs font-medium text-[#111315] leading-snug line-clamp-2">
                            {caixinhaPergunta || 'Como passar do teto de faturamento?'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CARD 4: Formato do anúncio (Matching Image 1) */}
          <div className="bg-[#15181c] rounded-xl border border-[#21252b] p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#F5F5F0]">Formato do anúncio</h2>
              <p className="text-sm text-[#92978F] mt-1">
                O vídeo do avatar pode ter qualquer proporção: ele é recortado para o formato escolhido, com o rosto no quadro. Dá para trocar depois, no editor.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {FORMATS.map(fmt => {
                const isSelected = selectedFormat === fmt.id;
                return (
                  <div
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center text-center justify-between min-h-[145px] ${
                      isSelected
                        ? 'border-[#C5F955] bg-[#C5F955]/10 ring-1 ring-[#C5F955]'
                        : 'border-[#21252b] hover:border-[#2f353d] bg-[#111315]'
                    }`}
                  >
                    {/* Outline icon shapes exactly as in Image 1 */}
                    <div className="h-12 flex items-center justify-center w-full">
                      {fmt.iconType === 'phone' && (
                        <div className={`w-[22px] h-[36px] rounded-[5px] border-2 transition-colors ${
                          isSelected ? 'border-[#C5F955] bg-[#C5F955]/20' : 'border-[#475569] bg-transparent'
                        }`} />
                      )}
                      {fmt.iconType === 'monitor' && (
                        <div className={`w-[38px] h-[22px] rounded-[3px] border-2 transition-colors ${
                          isSelected ? 'border-[#C5F955] bg-[#C5F955]/20' : 'border-[#475569] bg-transparent'
                        }`} />
                      )}
                      {fmt.iconType === 'square' && (
                        <div className={`w-[28px] h-[28px] rounded-[4px] border-2 transition-colors ${
                          isSelected ? 'border-[#C5F955] bg-[#C5F955]/20' : 'border-[#475569] bg-transparent'
                        }`} />
                      )}
                      {fmt.iconType === 'classic' && (
                        <div className={`w-[32px] h-[25px] rounded-[4px] border-2 transition-colors ${
                          isSelected ? 'border-[#C5F955] bg-[#C5F955]/20' : 'border-[#475569] bg-transparent'
                        }`} />
                      )}
                      {fmt.iconType === 'portrait' && (
                        <div className={`w-[25px] h-[33px] rounded-[4px] border-2 transition-colors ${
                          isSelected ? 'border-[#C5F955] bg-[#C5F955]/20' : 'border-[#475569] bg-transparent'
                        }`} />
                      )}
                      {fmt.iconType === 'panoramic' && (
                        <div className={`w-[40px] h-[19px] rounded-[3px] border-2 transition-colors ${
                          isSelected ? 'border-[#C5F955] bg-[#C5F955]/20' : 'border-[#475569] bg-transparent'
                        }`} />
                      )}
                    </div>

                    <div className="w-full mt-2">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-medium text-[#F5F5F0]">{fmt.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#C5F955] stroke-[2.5]" />}
                      </div>
                      <span className={`text-xs font-medium block mt-0.5 ${isSelected ? 'text-[#C5F955]' : 'text-[#92978F]'}`}>
                        {fmt.label}
                      </span>
                      <p className="text-[11px] text-[#92978F] leading-tight mt-1 whitespace-pre-line font-normal">
                        {fmt.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD 5: Headline de gancho (ONLY FOR ADS - Image 1. Hidden in VSL!) */}
          {!isVslMode && (
            <div className="bg-[#15181c] rounded-xl border border-[#21252b] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-[#F5F5F0]">Headline de gancho</h2>

                {/* Pill Segmented Control as in Image 1 */}
                <div className="inline-flex p-1 bg-[#111315] rounded-xl border border-[#21252b] text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setHeadlineMode('auto')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      headlineMode === 'auto'
                        ? 'bg-[#181c21] text-[#C5F955] border border-[#C5F955]/30'
                        : 'text-[#92978F] hover:text-[#F5F5F0]'
                    }`}
                  >
                    Automática
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeadlineMode('angle')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      headlineMode === 'angle'
                        ? 'bg-[#181c21] text-[#C5F955] border border-[#C5F955]/30'
                        : 'text-[#92978F] hover:text-[#F5F5F0]'
                    }`}
                  >
                    Escolher ângulo
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeadlineMode('none')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                      headlineMode === 'none'
                        ? 'bg-[#181c21] text-[#C5F955] border border-[#C5F955]/30'
                        : 'text-[#92978F] hover:text-[#F5F5F0]'
                    }`}
                  >
                    Sem headline
                  </button>
                </div>
              </div>

              {headlineMode === 'angle' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {HEADLINE_ANGLES_DEF.map(ang => {
                    const isSelected = selectedAngle === ang.id;
                    const hookText = currentNicheHooks[ang.id] || ang.defaultEx;
                    return (
                      <div
                        key={ang.id}
                        onClick={() => setSelectedAngle(ang.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#C5F955] bg-[#C5F955]/10 ring-1 ring-[#C5F955]'
                            : 'border-[#21252b] hover:border-[#2f353d] bg-[#111315]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-medium text-[#F5F5F0]">{ang.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#C5F955]" />}
                        </div>
                        <span className="text-xs text-[#92978F] leading-tight block font-normal">
                          {hookText.startsWith('“') ? hookText : `“${hookText}”`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {headlineMode === 'auto' && (
                <p className="text-sm text-[#92978F] leading-relaxed">
                  A IA identifica a fatia de público na fala e monta a headline (ângulo + benefício). Você edita o texto depois, no editor.
                </p>
              )}

              {headlineMode === 'none' && (
                <p className="text-sm text-[#92978F]">
                  Nenhum texto extra é desenhado no início do vídeo.
                </p>
              )}
            </div>
          )}

          {/* CARD 6: Legendas (opcional) (Matching Image 2) */}
          <div className="bg-[#15181c] rounded-xl border border-[#21252b] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="subCheck"
                checked={enableSubtitles}
                onChange={e => setEnableSubtitles(e.target.checked)}
                className="w-4 h-4 rounded text-[#C5F955] accent-[#C5F955] cursor-pointer"
              />
              <label htmlFor="subCheck" className="text-sm font-medium text-[#F5F5F0] cursor-pointer">
                Legendas automáticas
              </label>
              <span className="text-sm text-[#92978F]">
                · {enableSubtitles ? (selectedPresetObj?.name || 'Impacto') : 'desligadas'}
              </span>
            </div>

            {enableSubtitles && (
              <div className="space-y-4">
                {/* 17 presets cards matching Image 2 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                  {SUBTITLE_PRESETS.map(sub => {
                    const isSelected = selectedSubtitle === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubtitle(sub.id)}
                        className={`cursor-pointer rounded-xl p-1.5 flex flex-col justify-between text-center transition-all min-h-[92px] ${
                          isSelected
                            ? 'border-2 border-[#C5F955] bg-[#C5F955]/10'
                            : 'border border-[#21252b] hover:border-[#2f353d] bg-[#111315]'
                        }`}
                      >
                        <div className="h-12 bg-black rounded-lg flex items-center justify-center p-1 overflow-hidden">
                          {sub.activeWord ? (
                            <span className="text-[7px] font-black text-white uppercase leading-none">
                              EU DESCOBRI O <span className="text-[#FFD400]">{sub.activeWord}</span>
                            </span>
                          ) : sub.badge ? (
                            <span className="bg-[#181c21] text-white text-[7px] px-1 py-0.5 rounded font-bold">
                              {sub.preview}
                            </span>
                          ) : sub.pill ? (
                            <span className="bg-white text-rose-600 text-[7px] px-1.5 py-0.5 rounded-full font-black">
                              {sub.preview}
                            </span>
                          ) : sub.neon ? (
                            <span className="text-[7px] font-black text-cyan-400 drop-shadow-[0_0_6px_#06b6d4]">
                              {sub.preview}
                            </span>
                          ) : sub.boxWord ? (
                            <span className="text-[7px] font-bold text-white leading-none">
                              O INTESTINO <span className="bg-rose-600 px-0.5 py-0.5 text-white">{sub.boxWord}</span>
                            </span>
                          ) : sub.underline ? (
                            <span className="text-[7px] font-bold text-white underline decoration-amber-400 decoration-2">
                              {sub.preview}
                            </span>
                          ) : sub.serif ? (
                            <span className="text-[8px] font-bold text-amber-200 italic leading-tight">
                              {sub.preview}
                            </span>
                          ) : sub.mono ? (
                            <span className="text-[7px] font-mono font-bold text-emerald-400 bg-neutral-900 px-1 py-0.5 rounded">
                              {sub.preview}
                            </span>
                          ) : sub.focusPill ? (
                            <span className="bg-amber-400 text-black text-[8px] font-black px-1.5 py-0.5 rounded">
                              {sub.preview}
                            </span>
                          ) : sub.giantWord ? (
                            <span className="text-[7px] font-black text-white leading-none uppercase">
                              O CORPO <span className="text-amber-400 block text-[9px] font-black">{sub.giantWord}</span>
                            </span>
                          ) : sub.shadowDura ? (
                            <span className="text-[7px] font-black text-amber-100 uppercase drop-shadow-[1px_1px_0_#0f172a]">
                              {sub.preview}
                            </span>
                          ) : sub.pinkBlock ? (
                            <span className="text-[7px] font-black text-white uppercase bg-pink-600 px-1 py-0.5">
                              {sub.preview}
                            </span>
                          ) : sub.italicWord ? (
                            <span className="text-[9px] font-black text-cyan-400 italic">
                              {sub.preview}
                            </span>
                          ) : (
                            <span
                              style={{ color: sub.color || '#ffffff' }}
                              className="text-[7.5px] font-black uppercase leading-tight"
                            >
                              {sub.preview}
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-medium truncate mt-1 ${isSelected ? 'text-[#C5F955]' : 'text-[#92978F]'}`}>
                          {sub.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Subtitle customization row */}
                <div className="pt-3 border-t border-[#21252b] flex flex-wrap items-center justify-between gap-4 text-xs text-[#92978F]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#92978F]">Cor de destaque</span>
                    <input
                      type="color"
                      value={highlightColor}
                      onChange={e => setHighlightColor(e.target.value)}
                      className="w-7 h-5 rounded cursor-pointer border border-[#21252b] bg-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-1 max-w-xs">
                    <span className="text-xs text-[#92978F]">Fonte</span>
                    <input
                      type="range"
                      min="75"
                      max="140"
                      value={fontScale}
                      onChange={e => setFontScale(parseInt(e.target.value))}
                      className="flex-1 accent-[#C5F955] h-1.5 bg-[#181c21] rounded cursor-pointer"
                    />
                    <span className="font-mono text-[#F5F5F0] text-xs w-9 text-right">{fontScale}%</span>
                  </div>
                </div>

                <p className="text-xs text-[#92978F] leading-relaxed font-normal">
                  Posição automática: inferior nas cenas de avatar/b-roll, central nas telas divididas em pé (nos formatos deitados as metades ficam lado a lado e a legenda fica embaixo). Preview aproximado — o render usa as fontes reais. A legenda é queimada na renderização.
                </p>
              </div>
            )}
          </div>

          {/* CARD 7: Música de fundo (opcional) (Matching Image 2 - Drag/Upload Zone) */}
          <div className="bg-[#15181c] rounded-xl border border-[#21252b] p-6 space-y-3">
            <h2 className="text-sm font-semibold text-[#F5F5F0]">Música de fundo (opcional)</h2>

            {musicFile ? (
              <div className="border border-dashed border-[#C5F955]/60 bg-[#C5F955]/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C5F955]/20 text-[#C5F955] flex items-center justify-center">
                    <FileAudio className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#F5F5F0] block truncate max-w-xs">{musicFile.name}</span>
                    <span className="text-xs text-[#C5F955] font-medium">
                      {(musicFile.size / (1024 * 1024)).toFixed(2)} MB · Trilha pronta
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMusicFile(null)}
                  className="text-[#92978F] hover:text-rose-400 p-1 cursor-pointer"
                  title="Remover trilha"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="border border-[#21252b] hover:border-[#2f353d] bg-[#111315] rounded-xl p-5 flex items-center gap-3 cursor-pointer transition-colors block">
                <input
                  ref={musicInputRef}
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/m4a,audio/x-m4a"
                  onChange={handleMusicChange}
                  className="hidden"
                />
                <Music2 className="w-5 h-5 text-[#92978F] shrink-0" />
                <span className="text-sm text-[#92978F] font-normal">
                  Arraste a trilha aqui (MP3, WAV ou M4A)
                </span>
              </label>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: B-rolls da biblioteca (Matching screenshot 1:1) */}
        <div className="sticky top-6 space-y-4">
          <div className="bg-[#15181c] rounded-xl border border-[#21252b] p-6 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-[#F5F5F0]">B-rolls da biblioteca</h2>
              <p className="text-sm text-[#92978F] mt-1">
                0 vídeos específicos + {selectedCategories.length} categoria{selectedCategories.length === 1 ? ' inteira' : 's inteiras'} = {totalSelectedVideos} de {totalBrolls}
              </p>
            </div>

            {categories.length === 0 ? (
              <div className="py-8 px-4 border border-[#21252b] rounded-xl bg-[#111315] flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#181c21] text-[#C5F955] flex items-center justify-center border border-[#21252b]">
                  <Folder className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-[#F5F5F0]">Sua biblioteca está vazia</h3>
                  <p className="text-xs text-[#92978F] max-w-xs font-normal">
                    Nenhum B-roll foi importado ainda.
                  </p>
                </div>
                {onNavigateToLibrary && (
                  <button
                    type="button"
                    onClick={onNavigateToLibrary}
                    className="px-3.5 py-1.5 bg-[#C5F955]/10 hover:bg-[#C5F955]/20 text-[#C5F955] rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors border border-[#C5F955]/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar b-roll
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {categories.map(cat => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#C5F955]/60 bg-[#161a14]'
                          : 'border-[#21252b] hover:border-[#2f353d] bg-[#111315]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[#92978F] font-normal text-xs">&gt;</span>
                        <Folder className={`w-4 h-4 ${isSelected ? 'text-[#C5F955]' : 'text-[#92978F]'}`} />
                        <span className="font-medium text-xs text-[#F5F5F0]">{cat.name}</span>
                        <span className="text-xs text-[#92978F] font-normal">{cat.count || 0} vídeos</span>
                        {isSelected && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[#C5F955]/15 text-[#C5F955] border border-[#C5F955]/25">
                            categoria inteira
                          </span>
                        )}
                      </div>

                      <label
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCategory(cat.id)}
                          className="w-4 h-4 rounded text-[#C5F955] accent-[#C5F955] cursor-pointer"
                        />
                        <span className="text-xs text-[#92978F] font-normal">Usar categoria inteira</span>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-1">
              <p className="text-xs text-[#92978F] leading-relaxed flex items-start gap-1.5 font-normal">
                <span className="text-[#C5F955]">✨</span>
                <span>
                  Selecione categorias inteiras ou entre numa categoria e escolha vídeos específicos. A IA decide quantos momentos de b-roll cabem na fala do avatar.
                </span>
              </p>
            </div>

            {/* Action button inside right card matching screenshot */}
            <div className="pt-2">
              {isProcessing ? (
                <div className="p-4 rounded-xl bg-[#111315] border border-[#C5F955]/30 text-center space-y-2">
                  <div className="w-5 h-5 border-2 border-[#C5F955] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-medium text-[#C5F955] animate-pulse">{progressText}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  className="w-full py-3.5 rounded-xl bg-[#C5F955] hover:bg-[#b8ea44] text-[#111315] font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isVslMode ? 'Analisar e montar VSL' : 'Analisar e montar edição'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
