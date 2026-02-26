import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Initialize SQLite DB
const dbDir = join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}
const db = new Database(join(dbDir, 'app.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    user_id INTEGER PRIMARY KEY,
    provider TEXT DEFAULT 'gemini',
    api_key TEXT,
    model TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- API Routes ---

// Auth
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const hash = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
    const info = stmt.run(email, hash);
    
    // Initialize settings
    db.prepare('INSERT INTO settings (user_id) VALUES (?)').run(info.lastInsertRowid);

    const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none' });
    res.json({ message: 'User created', user: { id: info.lastInsertRowid, email } });
  } catch (err: any) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none' });
  res.json({ message: 'Logged in', user: { id: user.id, email: user.email } });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

app.get('/api/auth/me', authenticate, (req: any, res) => {
  res.json({ user: req.user });
});

// Settings
app.get('/api/settings', authenticate, (req: any, res) => {
  const settings = db.prepare('SELECT provider, api_key, model FROM settings WHERE user_id = ?').get(req.user.id);
  res.json(settings || { provider: 'gemini', api_key: '', model: '' });
});

app.post('/api/settings', authenticate, (req: any, res) => {
  const { provider, api_key, model } = req.body;
  db.prepare('UPDATE settings SET provider = ?, api_key = ?, model = ? WHERE user_id = ?')
    .run(provider, api_key, model, req.user.id);
  res.json({ message: 'Settings updated' });
});

// Documents
app.get('/api/documents', authenticate, (req: any, res) => {
  const docs = db.prepare('SELECT id, title, type, created_at FROM documents WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(docs);
});

app.get('/api/documents/:id', authenticate, (req: any, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  res.json(doc);
});

app.post('/api/documents', authenticate, (req: any, res) => {
  const { id, title, type, content } = req.body;
  db.prepare('INSERT INTO documents (id, user_id, title, type, content) VALUES (?, ?, ?, ?, ?)')
    .run(id, req.user.id, title, type, content);
  res.json({ message: 'Document saved' });
});

app.put('/api/documents/:id', authenticate, (req: any, res) => {
  const { title, content } = req.body;
  db.prepare('UPDATE documents SET title = ?, content = ? WHERE id = ? AND user_id = ?')
    .run(title, content, req.params.id, req.user.id);
  res.json({ message: 'Document updated' });
});

app.delete('/api/documents/:id', authenticate, (req: any, res) => {
  db.prepare('DELETE FROM documents WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Document deleted' });
});

// Start Server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
