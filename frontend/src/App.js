import { useState } from "react";
import "./App.css";

function App() {
  const API = "https://truckkroms.onrender.com";

  const [token, setToken] = useState(null);
  const [role, setRole] = useState("");
  const [checklists, setChecklists] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // Form checklist
  const [camion, setCamion] = useState("");
  const [chauffeur, setChauffeur] = useState("");
  const [chauffeurRend, setChauffeurRend] = useState("");
  const [chauffeurRecoit, setChauffeurRecoit] = useState("");
  const [pneus, setPneus] = useState("");
  const [carburant, setCarburant] = useState("OK");
  const [outils, setOutils] = useState("OK");
  const [remorque, setRemorque] = useState("");
  const [materiel, setMateriel] = useState("");
  const [incident, setIncident] = useState("");
  const [datePrise, setDatePrise] = useState("");
  const [dateRestitution, setDateRestitution] = useState("");

  // Admin
  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newRole, setNewRole] = useState("chauffeur");

  // Login
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // ---------------- LOGIN ----------------
  const login = async () => {
    const res = await fetch(API + "/login", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ username: loginUser, password: loginPass })
    });

    const data = await res.json();

    if (res.ok) {
      setToken(data.token);
      setRole(data.role);
      fetchChecklists(data.token);
      if (data.role === "admin") fetchUsers(data.token);
    } else {
      alert(data.error);
    }
  };

  // ---------------- CHECKLISTS ----------------
  const fetchChecklists = async (tok) => {
    const res = await fetch(API + "/checklist", {
      headers: { Authorization: "Bearer " + tok }
    });

    const data = await res.json();
    setChecklists(data);
  };

  const envoyerChecklist = async () => {
    const res = await fetch(API + "/checklist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        camion,
        chauffeur,
        chauffeurRend,
        chauffeurRecoit,
        pneus,
        carburant,
        outils,
        remorque,
        materiel,
        incident,
        datePrise,
        dateRestitution
      })
    });

    if (res.ok) {
      alert("Checklist envoyée !");
      fetchChecklists(token);
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  // ---------------- ADMIN ----------------
  const fetchUsers = async (tok) => {
    const res = await fetch(API + "/users", {
      headers: { Authorization: "Bearer " + tok }
    });

    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  const creerUtilisateur = async () => {
    const res = await fetch(API + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        username: newUser,
        password: newPass,
        role: newRole
      })
    });

    if (res.ok) {
      alert("Utilisateur créé !");
      setNewUser("");
      setNewPass("");
      setNewRole("chauffeur");
      fetchUsers(token);
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  // ---------------- FILTER ----------------
  const filteredChecklists = checklists.filter(c =>
    c.chauffeur.toLowerCase().includes(search.toLowerCase()) ||
    c.camion.toLowerCase().includes(search.toLowerCase())
  );

  // ---------------- LOGIN UI ----------------
  if (!token) {
    return (
      <div className="login-form">
        <h2>Connexion</h2>
        <input placeholder="Utilisateur" value={loginUser} onChange={e=>setLoginUser(e.target.value)} />
        <input type="password" placeholder="Mot de passe" value={loginPass} onChange={e=>setLoginPass(e.target.value)} />
        <button onClick={login}>Se connecter</button>
      </div>
    );
  }

  // ---------------- MAIN UI ----------------
  return (
    <div className="app-container">
      <header>
        <h1>Checklist Camion</h1>
        <button onClick={()=>{setToken(null); setRole("");}}>Déconnexion</button>
      </header>

      {role === "admin" && (
        <div className="admin-section">
          <h2>Créer un utilisateur</h2>
          <input placeholder="Nom utilisateur" value={newUser} onChange={e=>setNewUser(e.target.value)} />
          <input placeholder="Mot de passe" type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} />
          <select value={newRole} onChange={e=>setNewRole(e.target.value)}>
            <option value="chauffeur">Chauffeur</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={creerUtilisateur}>Créer</button>

          <h2>Utilisateurs</h2>
          <ul>
            {users.map(u => (
              <li key={u.id}>{u.username} - {u.role}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-section">
        <h2>Nouvelle checklist</h2>

        <input placeholder="Camion" value={camion} onChange={e=>setCamion(e.target.value)} />
        <input placeholder="Chauffeur" value={chauffeur} onChange={e=>setChauffeur(e.target.value)} />
        <input placeholder="Chauffeur Rend" value={chauffeurRend} onChange={e=>setChauffeurRend(e.target.value)} />
        <input placeholder="Chauffeur Reçoit" value={chauffeurRecoit} onChange={e=>setChauffeurRecoit(e.target.value)} />
        <input placeholder="Remorque" value={remorque} onChange={e=>setRemorque(e.target.value)} />
        <input placeholder="Matériel" value={materiel} onChange={e=>setMateriel(e.target.value)} />

        <select value={pneus} onChange={e=>setPneus(e.target.value)}>
          <option value="">État pneus</option>
          <option value="OK">OK</option>
          <option value="Usé">Usé</option>
          <option value="À changer">À changer</option>
          <option value="Crevé">Crevé</option>
        </select>

        <select value={incident} onChange={e=>setIncident(e.target.value)}>
          <option value="">Incident</option>
          <option value="OK">OK</option>
          <option value="Endommagé">Endommagé</option>
          <option value="Perdu">Perdu</option>
        </select>

        <input type="date" value={datePrise} onChange={e=>setDatePrise(e.target.value)} />
        <input type="date" value={dateRestitution} onChange={e=>setDateRestitution(e.target.value)} />

        <button onClick={envoyerChecklist}>Envoyer</button>
      </div>

      <div className="search-section">
        <input placeholder="Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div className="cards-container">
        {filteredChecklists.map(c => (
          <div key={c.id} className="card">
            <h3>{c.camion} - {c.chauffeur}</h3>
            <p>Remorque: {c.remorque}</p>
            <p>Matériel: {c.materiel}</p>
            <p>État: {c.incident || "OK"}</p>
            <p>Pneus: {c.pneus}</p>
            <p>Date: {c.datePrise} → {c.dateRestitution}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;