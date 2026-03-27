// server.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const SECRET_KEY = "un_secret_super_secure"; // à changer en production

app.use(cors());
app.use(express.json());

// Base de données SQLite
const db = new sqlite3.Database("./camion.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Base de données SQLite ouverte");
});

// --- Création des tables ---
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT  -- 'chauffeur' ou 'admin'
)`);

db.run(`
CREATE TABLE IF NOT EXISTS checklists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  camion TEXT,
  chauffeur TEXT,
  chauffeurRend TEXT,
  chauffeurRecoit TEXT,
  pneus TEXT,
  carburant TEXT,
  outils TEXT,
  remorque TEXT,
  materiel TEXT,
  incident TEXT,
  datePrise TEXT,
  dateRestitution TEXT,
  userId INTEGER,
  FOREIGN KEY(userId) REFERENCES users(id)
)
`);

// --- Middleware d'authentification ---
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Non autorisé" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Token invalide" });
    req.user = user;
    next();
  });
};

// --- Endpoint Register (création utilisateur réservée admin) ---
app.post("/register", authenticate, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Seulement l'admin peut créer des utilisateurs" });
  
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: "Tous les champs sont requis" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const stmt = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
  db.run(stmt, [username, hashedPassword, role], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// --- Endpoint Login ---
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: "Utilisateur non trouvé" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: "8h" });
    res.json({ token, role: user.role });
  });
});

// --- Endpoint GET checklists ---
app.get("/checklist", authenticate, (req, res) => {
  let query = "SELECT * FROM checklists";
  const params = [];

  if (req.user.role === "chauffeur") {
    query += " WHERE userId = ?";
    params.push(req.user.id);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// --- Endpoint POST checklist ---
app.post("/checklist", authenticate, (req, res) => {
  const { camion, chauffeur, chauffeurRend, chauffeurRecoit, pneus, carburant, outils, remorque, materiel, incident, datePrise, dateRestitution } = req.body;
  if (!camion || !chauffeur || !chauffeurRend || !chauffeurRecoit || !pneus || !carburant || !outils || !remorque || !datePrise || !dateRestitution) {
    return res.status(400).json({ error: "Tous les champs obligatoires doivent être remplis" });
  }

  const stmt = `INSERT INTO checklists
    (camion, chauffeur, chauffeurRend, chauffeurRecoit, pneus, carburant, outils, remorque, materiel, incident, datePrise, dateRestitution, userId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(stmt, [camion, chauffeur, chauffeurRend, chauffeurRecoit, pneus, carburant, outils, remorque, materiel, incident, datePrise, dateRestitution, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// --- Démarrage serveur ---
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});