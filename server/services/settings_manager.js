const fs = require('fs');
const path = require('path');
const { SETTINGS_FILE } = require('./storage_config');

const defaultSettings = {
  transcriptionProvider: 'groq', // 'groq', 'assemblyai', 'openai'
  groqApiKey: '',
  assemblyAiApiKey: '',
  openAiApiKey: '',
  llmProvider: 'gemini', // 'gemini', 'openrouter', 'openai'
  geminiApiKey: '',
  openRouterApiKey: '',
  defaultSubtitleStyle: 'hormozi_yellow',
  defaultTemplate: 'direct_response',
  enableWhooshTransitions: true
};

function getSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf-8');
      return defaultSettings;
    }
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return { ...defaultSettings, ...JSON.parse(data) };
  } catch (err) {
    console.error('Error reading settings:', err);
    return defaultSettings;
  }
}

function saveSettings(newSettings) {
  try {
    const current = getSettings();
    const updated = { ...current, ...newSettings };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (err) {
    console.error('Error saving settings:', err);
    throw err;
  }
}

module.exports = {
  getSettings,
  saveSettings
};
