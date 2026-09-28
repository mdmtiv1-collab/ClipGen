const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const LICENSE_FILE = path.join(__dirname, '..', 'storage', 'license.json');

/**
 * Gera um identificador único de hardware (HWID) do computador
 */
function getMachineHWID() {
  const cpus = os.cpus();
  const cpuModel = cpus && cpus[0] ? cpus[0].model : 'CPU';
  const hostname = os.hostname();
  const username = os.userInfo().username;
  const rawId = `${hostname}_${username}_${cpuModel}_${os.platform()}_${os.arch()}`;
  return crypto.createHash('sha256').update(rawId).digest('hex').substring(0, 16).toUpperCase();
}

/**
 * Lê o estado atual da licença
 */
function getLicenseStatus() {
  const hwid = getMachineHWID();

  if (!fs.existsSync(LICENSE_FILE)) {
    // Modo padrão inicial (Demonstração / Ativação pendente)
    return {
      active: true, // Deixa ativo por padrão no desenvolvimento
      isDemo: true,
      key: 'CLIPGEN-DEMO-2026-ACTIVE',
      plan: 'vitalicio',
      validUntil: '2028-12-31',
      machineId: hwid
    };
  }

  try {
    const data = JSON.parse(fs.readFileSync(LICENSE_FILE, 'utf8'));
    // Verifica se a licença bate com o computador atual
    const isThisMachine = !data.machineId || data.machineId === hwid;
    return {
      ...data,
      isThisMachine,
      currentMachineId: hwid
    };
  } catch (e) {
    return {
      active: false,
      isDemo: false,
      machineId: hwid
    };
  }
}

/**
 * Ativa uma licença neste computador
 */
function activateLicense(licenseKey, plan = 'mensal') {
  const hwid = getMachineHWID();
  const cleanKey = (licenseKey || '').trim().toUpperCase();

  if (!cleanKey || cleanKey.length < 8) {
    throw new Error('Chave de licença inválida. Verifique o código recebido no e-mail.');
  }

  // Define validade baseada no plano
  const now = new Date();
  let validUntil = new Date(now);
  if (plan === 'mensal') {
    validUntil.setMonth(now.getMonth() + 1);
  } else if (plan === 'anual') {
    validUntil.setFullYear(now.getFullYear() + 1);
  } else {
    validUntil.setFullYear(now.getFullYear() + 99); // Vitalício
  }

  const licenseData = {
    active: true,
    isDemo: false,
    key: cleanKey,
    plan: plan,
    activatedAt: now.toISOString(),
    validUntil: validUntil.toISOString().split('T')[0],
    machineId: hwid
  };

  const storageDir = path.dirname(LICENSE_FILE);
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

  fs.writeFileSync(LICENSE_FILE, JSON.stringify(licenseData, null, 2), 'utf8');
  return licenseData;
}

/**
 * Remove a licença para permitir uso em outro computador
 */
function deactivateLicense() {
  if (fs.existsSync(LICENSE_FILE)) {
    fs.unlinkSync(LICENSE_FILE);
  }
  return { active: false, machineId: getMachineHWID() };
}

module.exports = {
  getMachineHWID,
  getLicenseStatus,
  activateLicense,
  deactivateLicense
};
