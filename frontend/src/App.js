import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState("");
  const [checklists, setChecklists] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // Formulaire checklist
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

  // Création utilisateur (admin)
  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newRole, setNewRole] = useState("chauffeur");

  // Login
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  // --- Login ---
  const login = async () => {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({username: loginUser, password: loginPass})
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setRole(data.role);
      fetchChecklists(data.token, data.role);
      if(data.role === "admin") fetchUsers(data.token);
    } else alert(data.error);
  };

  // --- Fetch checklists ---
  const fetchChecklists = async (tokenValue, roleValue) => {
    const res = await fetch("http://localhost:3000/checklist", {
      headers: {Authorization: "Bearer " + tokenValue}
    });
    const data = await res.json();
    setChecklists(data);
  };

  // --- Fetch users (admin) ---
  const fetchUsers = async (tokenValue) => {
    // On utilise le fait que admin peut voir les utilisateurs via /users endpoint (à créer si besoin)
    const res = await fetch("http://localhost:3000/users", {
      headers: {Authorization: "Bearer " + tokenValue}
    });
    if(res.ok){
      const data = await res.json();
      setUsers(data);
    }
  };

  // --- Envoyer checklist ---
  const envoyerChecklist = async () => {
    const res = await fetch("http://localhost:3000/checklist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({camion, chauffeur, chauffeurRend, chauffeurRecoit, pneus, carburant, outils, remorque, materiel, incident, datePrise, dateRestitution})
    });
    if (res.ok) {
      alert("Checklist envoyée !");
      fetchChecklists(token, role);
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  // --- Créer utilisateur (admin) ---
  const creerUtilisateur = async () => {
    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({username: newUser, password: newPass, role: newRole})
    });
    if(res.ok){
      alert("Utilisateur créé !");
      setNewUser(""); setNewPass(""); setNewRole("chauffeur");
      fetchUsers(token);
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const filteredChecklists = checklists.filter(c =>
    c.chauffeur.toLowerCase().includes(search.toLowerCase()) ||
    c.camion.toLowerCase().includes(search.toLowerCase())
  );

  if (!token) return (
    <div className="login-form">
      <h2>Connexion</h2>
      <input placeholder="Utilisateur" value={loginUser} onChange={e=>setLoginUser(e.target.value)} />
      <input type="password" placeholder="Mot de passe" value={loginPass} onChange={e=>setLoginPass(e.target.value)} />
      <button onClick={login}>Se connecter</button>
    </div>
  );

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

          <h2>Liste des utilisateurs</h2>
          <ul>
            {users.map(u => <li key={u.id}>{u.username} - {u.role}</li>)}
          </ul>
        </div>
      )}

      <div className="form-section">
        <h2>Nouvelle checklist</h2>
        <input placeholder="Camion" value={camion} onChange={e=>setCamion(e.target.value)} />
        <input placeholder="Chauffeur" value={chauffeur} onChange={e=>setChauffeur(e.target.value)} />
        <input placeholder="Chauffeur Rend" value={chauffeurRend} onChange={e=>setChauffeurRend(e.target.value)} />
        <input placeholder="Chauffeur Recoit" value={chauffeurRecoit} onChange={e=>setChauffeurRecoit(e.target.value)} />
        <input placeholder="Remorque" value={remorque} onChange={e=>setRemorque(e.target.value)} />
        <input placeholder="Matériel à bord" value={materiel} onChange={e=>setMateriel(e.target.value)} />
        <select value={pneus} onChange={e=>setPneus(e.target.value)}>
          <option value="">État pneus</option>
          <option value="OK">OK</option>
          <option value="Usé">Usé</option>
          <option value="À changer">À changer</option>
          <option value="Crevé">Crevé</option>
        </select>
        <select value={incident} onChange={e=>setIncident(e.target.value)}>
          <option value="">État matériel</option>
          <option value="OK">OK</option>
          <option value="Endommagé">Endommagé</option>
          <option value="Perdu">Perdu</option>
        </select>
        <input type="date" value={datePrise} onChange={e=>setDatePrise(e.target.value)} />
        <input type="date" value={dateRestitution} onChange={e=>setDateRestitution(e.target.value)} />
        <button onClick={envoyerChecklist}>Envoyer</button>
      </div>

      <div className="search-section">
        <input placeholder="Rechercher chauffeur ou camion" value={search} onChange={e=>setSearch(e.target.value)} />
      </div>

      <div className="cards-container">
        {filteredChecklists.map(c => (
          <div key={c.id} className={`card ${c.incident==="Perdu"?"red":c.incident==="Endommagé"?"orange":"green"}`}>
            <h3>{c.camion} - {c.chauffeur}</h3>
            <p><strong>Remorque :</strong> {c.remorque}</p>
            <p><strong>Matériel :</strong> {c.materiel}</p>
            <p><strong>État :</strong> {c.incident || "OK"}</p>
            <p><strong>Pneus :</strong> {c.pneus}</p>
            <p><strong>Carburant :</strong> {c.carburant}</p>
            <p><strong>Outils :</strong> {c.outils}</p>
            <p><strong>Rendu par :</strong> {c.chauffeurRend}</p>
            <p><strong>Reçu par :</strong> {c.chauffeurRecoit}</p>
            <p><strong>Date :</strong> {c.datePrise} → {c.dateRestitution}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;