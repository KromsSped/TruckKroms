import { useState, useEffect } from "react";

const API = "https://truckkroms.onrender.com";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  if (!token) return <Login setToken={setToken} />;
  return <Dashboard token={token} setToken={setToken} />;
}

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

function Dashboard({ token, setToken }) {
  const [checklists, setChecklists] = useState([]);

  useEffect(() => {
    const fetchChecklists = async () => {
      const res = await fetch(API + "/checklist", {
        headers: { Authorization: "Bearer " + token }
      });
      const data = await res.json();
      setChecklists(data);
    };

    fetchChecklists();
  }, [token]);

  const logout = () => {
    localStorage.clear();
    setToken(null);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <button onClick={logout}>Déconnexion</button>

      {checklists.map(c => (
        <div key={c.id}>
          {c.camion} - {c.chauffeur}
        </div>
      ))}
    </div>
  );
}