const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { getCategories, createCategory, getBrollsByCategory, BROLLS_DIR } = require('./services/library_manager');
const { getSettings, saveSettings } = require('./services/settings_manager');
const { transcribeVideo } = require('./services/transcription');
const { generateEditingPlan, generateHeadlineAI, detectLanguage } = require('./services/ai_planner');
const { renderVideo } = require('./services/ffmpeg_renderer');
const { removeSilenceFromVideo } = require('./services/silence_remover');
const {
  getAllProjects,
  getProjectById,
  createProjectRecord,
  updateProject,
  deleteProject,
  formatDuration
} = require('./services/project_manager');

const {
  STORAGE_DIR,
  ASSETS_DIR,
  UPLOADS_DIR,
  OUTPUTS_DIR,
  TEMP_DIR,
  BROLLS_DIR,
  MUSIC_DIR,
  TRANSITIONS_DIR
} = require('./services/storage_config');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '100mb' }));

// Static file serving for videos and frontend
app.use('/storage/brolls', express.static(BROLLS_DIR));
app.use('/storage/uploads', express.static(UPLOADS_DIR));
app.use('/storage/outputs', express.static(OUTPUTS_DIR));
app.use('/storage/temp', express.static(TEMP_DIR));
app.use('/storage/music', express.static(MUSIC_DIR));
app.use('/storage/transitions', express.static(TRANSITIONS_DIR));

const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Storage setups
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}_${Math.round(Math.random() * 1e4)}${ext}`);
  }
});
const uploadAvatar = multer({ storage: uploadStorage });

const brollStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category || 'geral';
    const dest = path.join(BROLLS_DIR, category);
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`);
  }
});
const uploadBroll = multer({ storage: brollStorage });

// --- ROUTES ---

// 1. Library Categories
app.get('/api/brolls/categories', (req, res) => {
  try {
    const cats = getCategories();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/brolls/categories', (req, res) => {
  try {
    const { id, name } = req.body;
    const cat = createCategory(id, name);
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/brolls/upload', uploadBroll.array('files', 50), (req, res) => {
  try {
    const category = req.body.category;
    const files = (req.files || []).map(f => ({
      filename: f.filename,
      category,
      url: `/storage/brolls/${category}/${encodeURIComponent(f.filename)}`
    }));
    res.json({ success: true, count: files.length, files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const {
  getCategoryBrollsWithMetadata,
  analyzeBrollWithAI,
  updateBrollMetadata,
  deleteBrollFile
} = require('./services/broll_ai_analyzer');

app.get('/api/brolls/list/:category', (req, res) => {
  try {
    const files = getCategoryBrollsWithMetadata(req.params.category);
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/brolls/analyze', async (req, res) => {
  try {
    const { category, filename } = req.body;
    if (!category || !filename) {
      return res.status(400).json({ error: 'Categoria e nome de arquivo são obrigatórios.' });
    }
    const item = await analyzeBrollWithAI(category, filename);
    res.json({ success: true, item });
  } catch (err) {
    console.error('Error in /api/brolls/analyze:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/brolls/update', (req, res) => {
  try {
    const { category, filename, updates } = req.body;
    if (!category || !filename) {
      return res.status(400).json({ error: 'Categoria e nome de arquivo são obrigatórios.' });
    }
    const item = updateBrollMetadata(category, filename, updates);
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/brolls/delete', (req, res) => {
  try {
    const { category, filename } = req.body;
    if (!category || !filename) {
      return res.status(400).json({ error: 'Categoria e nome de arquivo são obrigatórios.' });
    }
    const result = deleteBrollFile(category, filename);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Headline AI generator on demand
app.post('/api/headlines/generate', async (req, res) => {
  try {
    const { transcriptText, angle, videoTitle } = req.body;
    const headline = await generateHeadlineAI({ transcriptText, angle, videoTitle });
    const lang = detectLanguage(`${videoTitle || ''} ${transcriptText || ''}`);
    res.json({ success: true, headline, language: lang });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const uploadProjectFiles = multer({ storage: uploadStorage }).fields([
  { name: 'videos', maxCount: 20 },
  { name: 'music', maxCount: 1 }
]);

async function processProjectJob(projectId, config) {
  const {
    file,
    template,
    format,
    headlineMode,
    headlineType,
    customHeadline,
    subtitleStyle,
    highlightColor,
    fontScale,
    categories,
    videoTitle,
    shouldRemoveSilences
  } = config;

  try {
    let activeVideoPath = file.path;
    let activeVideoUrl = `/storage/uploads/${file.filename}`;

    console.log(`[ClipGen Studio Async] Starting processing for ${projectId} (${file.filename})`);
    updateProject(projectId, {
      status: 'gerando',
      progress: 15,
      stage: 'Transcrevendo a fala do avatar...'
    });

    // 0. Silence Removal if enabled
    if (shouldRemoveSilences) {
      console.log(`[ClipGen Studio Async] Removing silences for ${projectId}...`);
      updateProject(projectId, {
        progress: 25,
        stage: 'Removendo pausas sem fala...'
      });
      const tightenedFilename = `tightened_${Date.now()}_${file.filename}`;
      const tightenedPath = path.join(path.dirname(file.path), tightenedFilename);
      const cutResult = await removeSilenceFromVideo(file.path, tightenedPath);
      if (cutResult.silencesRemoved > 0) {
        activeVideoPath = tightenedPath;
        activeVideoUrl = `/storage/uploads/${tightenedFilename}`;
        console.log(`[ClipGen Studio Async] Silences removed! New video: ${tightenedFilename}`);
      }
    }

    // 1. Transcription with word timestamps (AssemblyAI / Whisper)
    updateProject(projectId, {
      progress: 45,
      stage: 'Transcrevendo fala do avatar e sincronizando palavras...'
    });
    console.log(`[ClipGen Studio Async] Transcribing audio with word timestamps...`);
    const transcript = await transcribeVideo(activeVideoPath);

    // 2. AI Planning & Multi-scene continuous segmentation
    updateProject(projectId, {
      progress: 75,
      stage: 'Montando edição inteligente e selecionando B-rolls...'
    });
    console.log(`[ClipGen Studio Async] Generating continuous multi-scene plan...`);
    const duration = transcript.words?.[transcript.words.length - 1]?.end || 20.0;
    const plan = await generateEditingPlan({
      transcript,
      selectedCategories: categories,
      template,
      duration,
      headlineType,
      customHeadline: headlineMode !== 'sem_headline' ? customHeadline : '',
      videoTitle: videoTitle || file.originalname
    });

    if (headlineMode === 'sem_headline') {
      plan.headline = null;
    }

    // 3. Mark as ready for review
    console.log(`[ClipGen Studio Async] Finished! ${projectId} is ready for review with ${plan.broll_segments?.length} scenes.`);
    updateProject(projectId, {
      status: 'revisao',
      progress: 100,
      stage: 'Pronto para revisão',
      transcript,
      headline: plan.headline,
      broll_segments: plan.broll_segments,
      durationSec: Math.round(duration),
      durationFormatted: formatDuration(duration),
      baseVideo: {
        filename: path.basename(activeVideoPath),
        url: activeVideoUrl,
        path: activeVideoPath
      }
    });
  } catch (err) {
    console.error(`[ClipGen Studio Async] Error in job ${projectId}:`, err);
    updateProject(projectId, {
      status: 'falha',
      progress: 0,
      stage: 'Falha no processamento',
      error: err.message
    });
  }
}

// 3. Project Creation & Auto-Assembly (Async Flow)
app.post('/api/projects/create', uploadProjectFiles, async (req, res) => {
  try {
    const files = req.files?.['videos'] || [];
    const musicUploaded = req.files?.['music']?.[0] || null;

    if (files.length === 0) {
      return res.status(400).json({ error: 'Nenhum vídeo fornecido.' });
    }

    const template = req.body.template || 'direct_response';
    const format = req.body.format || '9:16';
    const headlineMode = req.body.headlineMode || 'escolher_angulo';
    const headlineType = req.body.headlineType || 'pergunta_paradoxal';
    const customHeadline = req.body.customHeadline || '';
    const subtitleStyle = req.body.subtitleStyle || 'uma_palavra';
    const highlightColor = req.body.highlightColor || '#00f2fe';
    const fontScale = parseInt(req.body.fontScale || '100');
    const categories = JSON.parse(req.body.categories || '[]');
    const videoTitle = req.body.title || '';
    const shouldRemoveSilences = req.body.removeSilences === 'true' || req.body.removeSilences === true;

    const musicUrl = musicUploaded ? `/storage/uploads/${musicUploaded.filename}` : null;
    const musicAbsPath = musicUploaded ? musicUploaded.path : null;

    const projects = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const projId = `proj_${Date.now()}_${i}`;

      const initialProject = {
        id: projId,
        title: videoTitle || file.originalname.replace(/\.[^/.]+$/, ''),
        baseVideo: {
          filename: path.basename(file.path),
          url: `/storage/uploads/${file.filename}`,
          path: file.path
        },
        music: musicUploaded ? {
          filename: musicUploaded.filename,
          url: musicUrl,
          path: musicAbsPath
        } : null,
        status: 'gerando',
        stage: 'Transcrevendo a fala do avatar...',
        progress: 10,
        format,
        template,
        subtitleStyle,
        highlightColor,
        fontScale,
        broll_segments: [],
        caixinha: template === 'caixinha_pergunta' ? {
          titulo: req.body.caixinhaTitulo || 'Consultoria gratuita',
          pergunta: req.body.caixinhaPergunta || 'Como passar do teto de faturamento?'
        } : null,
        isVslMode: req.body.isVslMode === 'true',
        createdAt: new Date().toISOString()
      };

      const savedProject = await createProjectRecord(initialProject);
      projects.push(savedProject);

      // Run processing asynchronously in background
      processProjectJob(projId, {
        file,
        template,
        format,
        headlineMode,
        headlineType,
        customHeadline,
        subtitleStyle,
        highlightColor,
        fontScale,
        categories,
        videoTitle,
        shouldRemoveSilences
      });
    }

    // Immediately respond to frontend with initial project records
    res.json({ success: true, count: projects.length, projects });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: err.message });
  }
});

// Projects Management Endpoints (VibeCut parity)
app.get('/api/projects', (req, res) => {
  try {
    const projects = getAllProjects();
    const stats = {
      todos: projects.length,
      revisao: projects.filter(p => p.status === 'revisao').length,
      gerando: projects.filter(p => p.status === 'gerando').length,
      concluido: projects.filter(p => p.status === 'concluido').length,
      prontos: projects.filter(p => p.status === 'pronto').length,
      falhas: projects.filter(p => p.status === 'falha').length
    };
    res.json({ projects, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List Rendered Outputs
app.get('/api/projects/outputs', (req, res) => {
  try {
    const outputsDir = path.join(__dirname, 'storage', 'outputs');
    if (!fs.existsSync(outputsDir)) return res.json([]);

    const files = fs.readdirSync(outputsDir)
      .filter(f => /\.(mp4|mov)$/i.test(f))
      .map(f => {
        const stats = fs.statSync(path.join(outputsDir, f));
        return {
          filename: f,
          url: `/storage/outputs/${encodeURIComponent(f)}`,
          size: stats.size,
          createdAt: stats.mtime
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download Rendered Video directly as attachment
app.get('/api/projects/download/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(__dirname, 'storage', 'outputs', filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo de vídeo não encontrado' });
    }
    res.download(filePath, filename);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id', (req, res) => {
  try {
    const proj = getProjectById(req.params.id);
    if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });
    res.json(proj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', (req, res) => {
  try {
    const updated = updateProject(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Projeto não encontrado' });
    res.json({ success: true, project: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:id/replan', async (req, res) => {
  try {
    const proj = getProjectById(req.params.id);
    if (!proj) return res.status(404).json({ error: 'Projeto não encontrado' });
    const transcript = proj.transcript || { words: [] };
    const duration = transcript.words?.[transcript.words.length - 1]?.end || proj.durationSec || 20.0;

    // Se o cliente passar customHeadline explicitamente, respeita; caso contrário, recalcula no idioma do áudio
    const customHeadline = req.body?.customHeadline || '';
    const headlineType = req.body?.headlineType || proj.headlineType || 'pergunta_paradoxal';

    const plan = await generateEditingPlan({
      transcript,
      selectedCategories: proj.categories || [],
      template: proj.template || 'direct_response',
      duration,
      headlineType,
      customHeadline,
      videoTitle: proj.title || 'Anúncio'
    });

    if (plan && plan.broll_segments && plan.broll_segments.length > 0) {
      const updated = updateProject(req.params.id, {
        broll_segments: plan.broll_segments,
        headline: plan.headline || proj.headline
      });
      return res.json({ success: true, project: updated });
    }
    res.status(500).json({ error: 'Falha ao gerar novo plano de edição' });
  } catch (err) {
    console.error('Error replanning project:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  try {
    const success = deleteProject(req.params.id);
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Music Tracks List
app.get('/api/music/list', (req, res) => {
  try {
    const musicDir = path.join(__dirname, 'storage', 'music');
    if (!fs.existsSync(musicDir)) return res.json([]);
    const files = fs.readdirSync(musicDir).filter(f => /\.(mp3|wav|ogg)$/i.test(f));
    res.json(files.map(f => ({
      filename: f,
      title: f.replace(/_/g, ' ').replace(/\.[^/.]+$/, '').toUpperCase(),
      url: `/storage/music/${encodeURIComponent(f)}`
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Render Final Video
app.post('/api/projects/render', async (req, res) => {
  try {
    const {
      baseVideoPath,
      segments,
      headline,
      format,
      template,
      subtitleStyle,
      highlightColor,
      fontScale,
      words,
      musicFile,
      musicVolume
    } = req.body;
    
    let absBaseVideo = baseVideoPath;
    if (baseVideoPath.startsWith('/storage/uploads/')) {
      absBaseVideo = path.join(__dirname, 'storage', 'uploads', path.basename(baseVideoPath));
    }

    const result = await renderVideo({
      baseVideoPath: absBaseVideo,
      segments,
      headline,
      format: format || '9:16',
      template,
      subtitleStyle,
      highlightColor: highlightColor || '#00f2fe',
      fontScale: fontScale || 100,
      words: words || [],
      musicFile,
      musicVolume
    });

    if (req.body.projectId) {
      updateProject(req.body.projectId, {
        status: 'pronto',
        outputVideoUrl: result.videoUrl,
        outputFilename: result.outputFilename
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Render error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Settings
app.get('/api/settings', (req, res) => {
  res.json(getSettings());
});

app.post('/api/settings', (req, res) => {
  try {
    const updated = saveSettings(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6.1 System Readiness Check
const { exec } = require('child_process');
app.get('/api/system/status', (req, res) => {
  try {
    const license = getLicenseStatus();
    const storageDir = path.join(__dirname, 'storage');
    const dbReady = fs.existsSync(storageDir);

    exec('ffmpeg -version', (err) => {
      const ffmpegReady = !err;
      res.json({
        license: {
          ready: !!license.active,
          key: license.key || '',
          plan: license.plan || 'vitalicio',
          machineId: license.machineId || '',
          statusText: license.active ? 'Código de licença funcionando' : 'Licença não ativada'
        },
        database: {
          ready: dbReady
        },
        ffmpeg: {
          ready: ffmpegReady
        }
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. License Management (HWID / Hotmart & Kiwify integration)
const { getLicenseStatus, activateLicense, deactivateLicense } = require('./services/license_manager');

app.get('/api/license/status', (req, res) => {
  res.json(getLicenseStatus());
});

app.post('/api/license/activate', (req, res) => {
  try {
    const { key, plan } = req.body;
    const activated = activateLicense(key, plan);
    res.json({ success: true, license: activated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/license/deactivate', (req, res) => {
  res.json(deactivateLicense());
});

if (fs.existsSync(clientDistPath)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/storage')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 ClipGen Studio Server online na porta ${PORT}`);
  console.log(`📡 URL API: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
