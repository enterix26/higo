import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface MemberOverride {
  higoId?: string;
  password?: string;
  name?: string;
  phone?: string;
  sales?: number;
  memo?: string;
  updatedAt?: string;
}

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'member-overrides.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory store for member overrides, loaded from and saved to disk
let overridesStore: Record<string, MemberOverride> = {};

function loadOverrides(): Record<string, MemberOverride> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('[Server] Failed to read data file, initializing empty store', err);
  }
  return {};
}

function saveOverrides(): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(overridesStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Failed to persist data file', err);
  }
}

// Initial load
overridesStore = loadOverrides();

async function startServer() {
  const app = express();

  app.use(express.json());

  // ----------------------------------------------------
  // API Routes (must be declared BEFORE Vite middleware)
  // ----------------------------------------------------

  // Server health & status
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      serverTime: new Date().toISOString(),
      activeOverrides: Object.keys(overridesStore).length,
    });
  });

  // Server metadata and access info
  app.get('/api/server-info', (req, res) => {
    res.json({
      status: 'online',
      platform: 'higo Binary MLM Server',
      totalAccounts: 10000,
      activeOverridesCount: Object.keys(overridesStore).length,
      port: PORT,
      serverTime: new Date().toISOString(),
    });
  });

  // Get all member overrides
  app.get('/api/members/overrides', (req, res) => {
    res.json(overridesStore);
  });

  // Get single member override
  app.get('/api/members/:id', (req, res) => {
    const id = req.params.id.toLowerCase();
    const override = overridesStore[id] || null;
    res.json({ id, override });
  });

  // Update a member's information (name, phone, password, sales, memo, higoId)
  app.put('/api/members/:id', (req, res) => {
    const id = req.params.id.toLowerCase();
    const { higoId, password, name, phone, sales, memo } = req.body;

    const existing = overridesStore[id] || {};
    const updated: MemberOverride = {
      ...existing,
      ...(higoId !== undefined && { higoId: String(higoId).trim() }),
      ...(password !== undefined && { password: String(password).trim() }),
      ...(name !== undefined && { name: String(name).trim() }),
      ...(phone !== undefined && { phone: String(phone).trim() }),
      ...(sales !== undefined && { sales: Number(sales) || 0 }),
      ...(memo !== undefined && { memo: String(memo).trim() }),
      updatedAt: new Date().toISOString(),
    };

    overridesStore[id] = updated;
    saveOverrides();

    console.log(`[Server] Member ${id} updated:`, updated);
    res.json({ success: true, id, override: updated });
  });

  // Reset all sales to 0 on server
  app.post('/api/admin/reset-sales', (req, res) => {
    let modifiedCount = 0;
    for (const id of Object.keys(overridesStore)) {
      if (overridesStore[id] && overridesStore[id].sales !== 0) {
        overridesStore[id].sales = 0;
        overridesStore[id].updatedAt = new Date().toISOString();
        modifiedCount++;
      }
    }
    saveOverrides();
    console.log(`[Server] Reset all sales to 0. Modified count: ${modifiedCount}`);
    res.json({ success: true, modifiedCount, overrides: overridesStore });
  });

  // Reset all overrides to default
  app.post('/api/admin/reset-all', (req, res) => {
    overridesStore = {};
    saveOverrides();
    console.log('[Server] Cleared all member overrides');
    res.json({ success: true });
  });

  // Authentication endpoint
  app.post('/api/auth/login', (req, res) => {
    const { id, password } = req.body;
    const cleanId = String(id || '').trim().toLowerCase();
    const cleanPw = String(password || '').trim();

    if (!cleanId) {
      return res.status(400).json({ success: false, error: '아이디를 입력해주세요.' });
    }

    // 1. Admin login
    if (cleanId === 'admin') {
      if (cleanPw === 'admin' || cleanPw === '1234') {
        return res.json({ success: true, role: 'admin', memberId: 'admin' });
      }
      return res.status(401).json({ success: false, error: '관리자 비밀번호가 일치하지 않습니다.' });
    }

    // 2. Member lookup by registered ID (e.g. a01) or HiGoID
    let resolvedId: string | null = null;
    let memberOverride: MemberOverride | undefined;

    // Check if directly a01~a10000
    if (cleanId.startsWith('a') || !isNaN(Number(cleanId))) {
      let num = cleanId.startsWith('a') ? parseInt(cleanId.slice(1), 10) : parseInt(cleanId, 10);
      if (!isNaN(num) && num >= 1 && num <= 10000) {
        resolvedId = num < 10 ? `a0${num}` : `a${num}`;
        memberOverride = overridesStore[resolvedId];
      }
    }

    // Check by custom higoId
    if (!resolvedId) {
      for (const [mid, ovr] of Object.entries(overridesStore)) {
        if (ovr.higoId && ovr.higoId.toLowerCase() === cleanId) {
          resolvedId = mid;
          memberOverride = ovr;
          break;
        }
      }
    }

    if (!resolvedId) {
      return res.status(404).json({ success: false, error: '존재하지 않는 회원 아이디입니다.' });
    }

    const expectedPassword = memberOverride?.password || '1234';
    if (cleanPw !== expectedPassword) {
      return res.status(401).json({ success: false, error: '비밀번호가 일치하지 않습니다.' });
    }

    return res.json({
      success: true,
      role: 'member',
      memberId: resolvedId,
      override: memberOverride || null,
    });
  });

  // ----------------------------------------------------
  // Vite Middleware (Development) / Static Files (Production)
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] higo Binary MLM backend server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
