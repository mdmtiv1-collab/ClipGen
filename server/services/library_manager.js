const fs = require('fs');
const path = require('path');

const BROLLS_DIR = path.join(__dirname, '..', 'storage', 'brolls');

function initCategories() {
  if (!fs.existsSync(BROLLS_DIR)) {
    fs.mkdirSync(BROLLS_DIR, { recursive: true });
  }
}

function getCategories() {
  initCategories();
  const entries = fs.readdirSync(BROLLS_DIR, { withFileTypes: true });

  return entries
    .filter(entry => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map(entry => {
      const catPath = path.join(BROLLS_DIR, entry.name);
      const files = fs.readdirSync(catPath).filter(f => /\.(mp4|mov|webm|mkv|jpg|png|webp)$/i.test(f));
      const displayName = entry.name.replace(/_/g, ' ');

      return {
        id: entry.name,
        name: displayName,
        count: files.length,
        files: files.map(f => ({
          filename: f,
          url: `/storage/brolls/${encodeURIComponent(entry.name)}/${encodeURIComponent(f)}`
        }))
      };
    });
}

function createCategory(id, name) {
  initCategories();
  const safeId = (id || name || 'nova_categoria').toLowerCase().replace(/[^a-z0-9_]/g, '_');
  const catPath = path.join(BROLLS_DIR, safeId);
  if (!fs.existsSync(catPath)) {
    fs.mkdirSync(catPath, { recursive: true });
  }
  return {
    id: safeId,
    name: name || safeId,
    count: 0,
    files: []
  };
}

function deleteCategory(categoryId) {
  initCategories();
  const catPath = path.join(BROLLS_DIR, categoryId);
  if (fs.existsSync(catPath)) {
    fs.rmSync(catPath, { recursive: true, force: true });
  }
  return { success: true, deleted: categoryId };
}

function getBrollsByCategory(categoryId) {
  initCategories();
  const catPath = path.join(BROLLS_DIR, categoryId);
  if (!fs.existsSync(catPath)) return [];

  const files = fs.readdirSync(catPath).filter(f => /\.(mp4|mov|webm|mkv|jpg|png|webp)$/i.test(f));
  return files.map(f => ({
    filename: f,
    category: categoryId,
    url: `/storage/brolls/${encodeURIComponent(categoryId)}/${encodeURIComponent(f)}`
  }));
}

module.exports = {
  BROLLS_DIR,
  getCategories,
  createCategory,
  deleteCategory,
  getBrollsByCategory
};
