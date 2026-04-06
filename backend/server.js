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
app.use(express.urlencoded({ extended: true }));

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

// ---------------- CREATE ADMIN ----------------
bcrypt.hash("KromsSped", 10).then(hash => {
  db.run(
    "INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)",
    ["admin", hash, "admin"]
  );
});

// ---------------- AUTH ----------------
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

// ---------------- REGISTER ----------------
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

// ---------------- GET USERS ----------------
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
  const camion = req.body.camion;
  const chauffeur = req.body.chauffeur;

  // Vérification simple
  if (!camion || !chauffeur) {
    return res.status(400).json({ error: "Camion et chauffeur obligatoires" });
  }

  db.run(
    `INSERT INTO checklists (camion, chauffeur, userId)
     VALUES (?, ?, ?)`,
    [camion, chauffeur, req.user.id],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }

      res.json({ id: this.lastID });
    }
  );
});

// ---------------- TEST ----------------
app.get("/", (req, res) => {
  res.send("API Camion OK 🚀");
});

// ---------------- START ----------------
app.listen(PORT, () => {
  console.log("🚀 Serveur lancé sur port", PORT);
});