const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const DB_FILE = path.join(__dirname, '..', 'storage', 'projects.json');
const THUMBS_DIR = path.join(__dirname, '..', 'storage', 'uploads', 'thumbnails');

if (!fs.existsSync(THUMBS_DIR)) {
  fs.mkdirSync(THUMBS_DIR, { recursive: true });
}

function loadProjects() {
  if (!fs.existsSync(DB_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading projects.json:', err);
    return [];
  }
}

function saveAllProjects(projects) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(projects, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing projects.json:', err);
  }
}

function generateThumbnail(videoPath, thumbFilename) {
  return new Promise((resolve) => {
    const thumbPath = path.join(THUMBS_DIR, thumbFilename);
    const cmd = `ffmpeg -y -ss 00:00:01 -i "${videoPath}" -vframes 1 -q:v 2 "${thumbPath}"`;
    exec(cmd, (err) => {
      if (err) {
        console.warn('Thumbnail generation warning:', err.message);
        resolve(null);
      } else {
        resolve(`/storage/uploads/thumbnails/${thumbFilename}`);
      }
    });
  });
}

function getVideoDuration(videoPath) {
  return new Promise((resolve) => {
    const cmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`;
    exec(cmd, (err, stdout) => {
      if (err) {
        resolve(20);
      } else {
        const d = parseFloat(stdout.trim()) || 20;
        resolve(d);
      }
    });
  });
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

async function createProjectRecord(projectData) {
  const projects = loadProjects();
  
  let thumbUrl = null;
  if (projectData.baseVideo?.path && fs.existsSync(projectData.baseVideo.path)) {
    const thumbName = `thumb_${Date.now()}_${path.basename(projectData.baseVideo.filename, path.extname(projectData.baseVideo.filename))}.jpg`;
    thumbUrl = await generateThumbnail(projectData.baseVideo.path, thumbName);
  }

  let durationSec = 20;
  if (projectData.baseVideo?.path && fs.existsSync(projectData.baseVideo.path)) {
    durationSec = await getVideoDuration(projectData.baseVideo.path);
  } else if (projectData.transcript?.words?.length) {
    durationSec = projectData.transcript.words[projectData.transcript.words.length - 1].end || 20;
  }

  const newProject = {
    ...projectData,
    id: projectData.id || `proj_${Date.now()}`,
    status: projectData.status || 'gerando', // 'gerando' | 'revisao' | 'concluido' | 'pronto' | 'falha'
    progress: projectData.progress !== undefined ? projectData.progress : 10,
    stage: projectData.stage || 'Transcrevendo a fala do avatar...',
    thumbnailUrl: thumbUrl,
    durationSec: Math.round(durationSec),
    durationFormatted: formatDuration(durationSec),
    createdAt: projectData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  projects.unshift(newProject);
  saveAllProjects(projects);
  return newProject;
}

function getAllProjects() {
  return loadProjects();
}

function getProjectById(id) {
  const projects = loadProjects();
  return projects.find(p => p.id === id) || null;
}

function updateProject(id, updates) {
  const projects = loadProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;

  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  saveAllProjects(projects);
  return projects[index];
}

function deleteProject(id) {
  let projects = loadProjects();
  const beforeLen = projects.length;
  projects = projects.filter(p => p.id !== id);
  saveAllProjects(projects);
  return projects.length < beforeLen;
}

module.exports = {
  loadProjects,
  getAllProjects,
  getProjectById,
  createProjectRecord,
  updateProject,
  deleteProject,
  generateThumbnail,
  getVideoDuration,
  formatDuration
};
