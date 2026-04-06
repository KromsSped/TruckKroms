import { useState, useEffect } from "react";

const API = "https://truckkroms.onrender.com";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  if (!token) return <Login setToken={setToken} />;
  return <Dashboard token={token} setToken={setToken} />;
}

// LOGIN
function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } else {
      alert(data.error);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Connexion</h2>
      <input placeholder="Utilisateur" onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Mot de passe" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Se connecter</button>
    </div>
  );
}

// DASHBOARD
function Dashboard({ token, setToken }) {
  const [checklists, setChecklists] = useState([]);

  const fetchChecklists = async () => {
    const res = await fetch(API + "/checklist", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    setChecklists(data);
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  const logout = () => {
    localStorage.clear();
    setToken(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <button onClick={logout}>Déconnexion</button>

      <ChecklistForm token={token} refresh={fetchChecklists} />

      <h2>Historique</h2>

      {checklists.length === 0 && <p>Aucune donnée</p>}

      {checklists.map(c => (
        <div key={c.id} style={{ border: "1px solid #ccc", marginBottom: 10 }}>
          {c.camion} - {c.chauffeur}
        </div>
      ))}
    </div>
  );
}

// FORMULAIRE
function ChecklistForm({ token, refresh }) {
  const [camion, setCamion] = useState("");
  const [chauffeur, setChauffeur] = useState("");

  const submit = async () => {
    const res = await fetch(API + "/checklist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ camion, chauffeur })
    });

    if (res.ok) {
      alert("Envoyé !");
      setCamion("");
      setChauffeur("");
      refresh();
    } else {
      alert("Erreur");
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Nouvelle checklist</h2>
      <input placeholder="Camion" value={camion} onChange={e => setCamion(e.target.value)} />
      <input placeholder="Chauffeur" value={chauffeur} onChange={e => setChauffeur(e.target.value)} />
      <button onClick={submit}>Envoyer</button>
    </div>
  );
}