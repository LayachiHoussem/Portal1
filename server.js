const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Fichiers statiques
app.use('/documents', express.static(path.join(__dirname, 'public', 'documents')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Serve le frontend buildé
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist'))); // si tu utilises Vite
// app.use(express.static(path.join(__dirname, '..', 'frontend', 'build'))); // si tu utilises Create React App

// Route fallback (React SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html')); // ou 'build'
});

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'public', 'documents', req.body.department);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Upload API
app.post('/upload', upload.single('file'), (req, res) => {
  const { department, title, description, image } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'Aucun fichier' });

  const jsonPath = path.join(__dirname, 'documents.json');
  let jsonData = { departments: {} };

  if (fs.existsSync(jsonPath)) {
    jsonData = JSON.parse(fs.readFileSync(jsonPath));
  }

  if (!jsonData.departments[department]) {
    jsonData.departments[department] = { documents: [] };
  }

  jsonData.departments[department].documents.push({
    title,
    description,
    image: image || './image/word.png',
    url: `./documents/${department}/${file.originalname}`
  });

  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');

  res.json({ success: true });
});

// JSON data API
app.get('/documents.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'documents.json'));
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur backend en écoute sur http://localhost:${PORT}`);
});
