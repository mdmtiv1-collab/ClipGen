const path = require('path');
const fs = require('fs');
const os = require('os');

// Determine Writable Storage Directory
// Priority:
// 1. process.env.CLIPGEN_DATA_DIR
// 2. User directory: C:\Users\<user>\ClipGen\storage
// 3. Fallback: server/storage (development)
function getStorageDir() {
  if (process.env.CLIPGEN_DATA_DIR) {
    return process.env.CLIPGEN_DATA_DIR;
  }
  const userClipGen = path.join(os.homedir(), 'ClipGen', 'storage');
  if (fs.existsSync(path.join(os.homedir(), 'ClipGen'))) {
    return userClipGen;
  }
  return path.join(__dirname, '..', 'storage');
}

const STORAGE_DIR = getStorageDir();
const ASSETS_DIR = process.env.CLIPGEN_ASSETS_DIR || path.join(__dirname, '..', 'storage');

// Ensure writable directories exist
const DIRS = [
  STORAGE_DIR,
  path.join(STORAGE_DIR, 'uploads'),
  path.join(STORAGE_DIR, 'uploads', 'thumbnails'),
  path.join(STORAGE_DIR, 'outputs'),
  path.join(STORAGE_DIR, 'temp'),
  path.join(STORAGE_DIR, 'brolls')
];

for (const dir of DIRS) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    console.warn(`[Storage Config] Notice creating dir ${dir}:`, e.message);
  }
}

// Seed initial projects.json if it doesn't exist
const PROJECTS_FILE = path.join(STORAGE_DIR, 'projects.json');
if (!fs.existsSync(PROJECTS_FILE)) {
  const seedProjects = path.join(__dirname, '..', 'storage', 'projects.json');
  try {
    if (fs.existsSync(seedProjects)) {
      fs.copyFileSync(seedProjects, PROJECTS_FILE);
    } else {
      fs.writeFileSync(PROJECTS_FILE, '[]', 'utf8');
    }
  } catch (e) {
    fs.writeFileSync(PROJECTS_FILE, '[]', 'utf8');
  }
}

// Seed settings.json if it doesn't exist
const SETTINGS_FILE = path.join(STORAGE_DIR, 'settings.json');
if (!fs.existsSync(SETTINGS_FILE)) {
  const seedSettings = path.join(__dirname, '..', 'settings.json');
  try {
    if (fs.existsSync(seedSettings)) {
      fs.copyFileSync(seedSettings, SETTINGS_FILE);
    }
  } catch (e) {}
}

module.exports = {
  STORAGE_DIR,
  ASSETS_DIR,
  UPLOADS_DIR: path.join(STORAGE_DIR, 'uploads'),
  THUMBS_DIR: path.join(STORAGE_DIR, 'uploads', 'thumbnails'),
  OUTPUTS_DIR: path.join(STORAGE_DIR, 'outputs'),
  TEMP_DIR: path.join(STORAGE_DIR, 'temp'),
  BROLLS_DIR: path.join(STORAGE_DIR, 'brolls'),
  PROJECTS_FILE,
  SETTINGS_FILE,
  LICENSE_FILE: path.join(STORAGE_DIR, 'license.json'),
  MUSIC_DIR: fs.existsSync(path.join(STORAGE_DIR, 'music')) ? path.join(STORAGE_DIR, 'music') : path.join(ASSETS_DIR, 'music'),
  TRANSITIONS_DIR: fs.existsSync(path.join(STORAGE_DIR, 'transitions')) ? path.join(STORAGE_DIR, 'transitions') : path.join(ASSETS_DIR, 'transitions'),
  FONTS_DIR: path.join(ASSETS_DIR, 'fonts')
};
