const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "dev_secret";

app.use(cors());
app.use(express.json());

// ---------------- DATABASE ----------------
const db = new sqlite3.Database("./camion.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS checklists (
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
    userId INTEGER
  )`);
});

// ---------------- CREATE ADMIN (UNE SEULE FOIS) ----------------
bcrypt.hash("KromsSped", 10).then(hash => {
  db.run(
    "INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)",
    ["admin", hash, "admin"]
  );
});

// ---------------- AUTH MIDDLEWARE ----------------
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

// ---------------- LOGIN ----------------
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
    if (err || !user) return res.status(401).json({ error: "Utilisateur non trouvé" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: "8h" }
    );

    res.json({ token, role: user.role });
  });
});

// ---------------- REGISTER (ADMIN) ----------------
app.post("/register", authenticate, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  const { username, password, role } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, hashed, role],
    function (err) {
      if (err) return res.status(400).json({ error: "Erreur création utilisateur" });

      res.json({ id: this.lastID });
    }
  );
});

// ---------------- GET USERS (ADMIN) ----------------
app.get("/users", authenticate, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès refusé" });
  }

  db.all("SELECT id, username, role FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ---------------- GET CHECKLISTS ----------------
app.get("/checklist", authenticate, (req, res) => {
  if (req.user.role === "admin") {
    db.all("SELECT * FROM checklists", [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    db.all(
      "SELECT * FROM checklists WHERE userId = ?",
      [req.user.id],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  }
});

// ---------------- ADD CHECKLIST ----------------
app.post("/checklist", authenticate, (req, res) => {
  const d = req.body;

  db.run(
    `INSERT INTO checklists (
      camion, chauffeur, chauffeurRend, chauffeurRecoit,
      pneus, carburant, outils, remorque, materiel,
      incident, datePrise, dateRestitution, userId
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      d.camion,
      d.chauffeur,
      d.chauffeurRend,
      d.chauffeurRecoit,
      d.pneus,
      d.carburant,
      d.outils,
      d.remorque,
      d.materiel,
      d.incident,
      d.datePrise,
      d.dateRestitution,
      req.user.id
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ id: this.lastID });
    }
  );
});

// ---------------- TEST ROUTE ----------------
app.get("/", (req, res) => {
  res.send("API Camion OK 🚀");
});

// ---------------- START SERVER ----------------
app.listen(PORT, () => {
  console.log("🚀 Serveur lancé sur port", PORT);
});