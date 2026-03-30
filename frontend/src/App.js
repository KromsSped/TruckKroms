import { useState, useEffect } from "react";

const API = "https://truckkroms.onrender.com";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  if (!token) return <Login setToken={setToken} setRole={setRole} />;
  return <Dashboard token={token} setToken={setToken} />;
}

// ---------------- LOGIN ----------------
function Login({ setToken, setRole }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await fetch(API + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      setToken(data.token);
      setRole(data.role);
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

// ---------------- DASHBOARD ----------------
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
      <ChecklistList checklists={checklists} />
    </div>
  );
}

// ---------------- FORM ----------------
function ChecklistForm({ token, refresh }) {
  const [camion, setCamion] = useState("");
  const [chauffeur, setChauffeur] = useState("");
  const [photo, setPhoto] = useState(null);

  const submit = async () => {
    const formData = new FormData();
    formData.append("camion", camion);
    formData.append("chauffeur", chauffeur);
    if (photo) formData.append("photo", photo);

    const res = await fetch(API + "/checklist", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token
      },
      body: formData
    });

    if (res.ok) {
      alert("Envoyé !");
      setCamion("");
      setChauffeur("");
      setPhoto(null);
      refresh();
    }
  };

  return (
    <div>
      <h2>Nouvelle checklist</h2>
      <input placeholder="Camion" value={camion} onChange={e => setCamion(e.target.value)} />
      <input placeholder="Chauffeur" value={chauffeur} onChange={e => setChauffeur(e.target.value)} />
      <input type="file" onChange={e => setPhoto(e.target.files[0])} />
      <button onClick={submit}>Envoyer</button>
    </div>
  );
}

// ---------------- LIST ----------------
function ChecklistList({ checklists }) {
  return (
    <div>
      <h2>Historique</h2>
      {checklists.map(c => (
        <div key={c.id}>
          <h3>{c.camion} - {c.chauffeur}</h3>
          {c.photo && (
            <img
              src={API + "/uploads/" + c.photo}
              alt=""
              width="200"
            />
          )}
        </div>
      ))}
    </div>
  );
}