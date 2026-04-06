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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } else {
      alert("Erreur login");
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
  const [camion, setCamion] = useState("");
  const [chauffeur, setChauffeur] = useState("");
  const [chauffeurRend, setChauffeurRend] = useState("");
  const [chauffeurRecoit, setChauffeurRecoit] = useState("");
  const [pneus, setPneus] = useState("");
  const [carburant, setCarburant] = useState("");
  const [outils, setOutils] = useState("");
  const [remorque, setRemorque] = useState("");
  const [materiel, setMateriel] = useState(""); 
  const [incident, setIncident] = useState("");
  const [datePrise, setDatePrise] = useState("");
 const [dateRestitution, setDateRestitution] = useState("");

  const fetchChecklists = async () => {
    const res = await fetch(API + "/checklist", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    setChecklists(data);
  };

  useEffect(() => {
  const fetchData = async () => {
    const res = await fetch(API + "/checklist", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    setChecklists(data);
  };

  fetchData();
}, [token]);

  const logout = () => {
    localStorage.clear();
    setToken(null);
  };

 const ajouter = async () => {
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
    setCamion("");
    setChauffeur("");
    setChauffeurRend("");
    setChauffeurRecoit("");
    setPneus("");
    setCarburant("");
    setOutils("");
    setRemorque("");
    setMateriel("");
    setIncident("");
    setDatePrise("");
    setDateRestitution("");

    fetchChecklists();
  } else {
    alert("Erreur envoi");
  }
};

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <button onClick={logout}>Déconnexion</button>

      <h2>Ajouter une checklist</h2>
      <input value={camion} onChange={e => setCamion(e.target.value)} placeholder="Camion" />
      <input value={chauffeur} onChange={e => setChauffeur(e.target.value)} placeholder="Chauffeur" />
      <input placeholder="Chauffeur Rend" onChange={e => setChauffeurRend(e.target.value)} />
      <input placeholder="Chauffeur Reçoit" onChange={e => setChauffeurRecoit(e.target.value)} />
      <input placeholder="Pneus" onChange={e => setPneus(e.target.value)} />
      <input placeholder="Carburant" onChange={e => setCarburant(e.target.value)} />
      <input placeholder="Outils" onChange={e => setOutils(e.target.value)} />
      <input placeholder="Remorque" onChange={e => setRemorque(e.target.value)} />
      <input placeholder="Matériel" onChange={e => setMateriel(e.target.value)} />
      <input placeholder="Incident" onChange={e => setIncident(e.target.value)} />
      <input type="date" onChange={e => setDatePrise(e.target.value)} />
      <input type="date" onChange={e => setDateRestitution(e.target.value)} />
      <button onClick={ajouter}>Envoyer</button>

      <h2>Historique</h2>

     {checklists.map(c => (
      <div key={c.id} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}>
        <p><b>Camion:</b> {c.camion}</p>
        <p><b>Chauffeur:</b> {c.chauffeur}</p>
        <p><b>Chauffeur Rend:</b> {c.chauffeurRend}</p>
        <p><b>Chauffeur Reçoit:</b> {c.chauffeurRecoit}</p>
        <p><b>Pneus:</b> {c.pneus}</p>
        <p><b>Carburant:</b> {c.carburant}</p>
        <p><b>Outils:</b> {c.outils}</p>
        <p><b>Remorque:</b> {c.remorque}</p>
        <p><b>Matériel:</b> {c.materiel}</p>
        <p><b>Incident:</b> {c.incident}</p>
        <p><b>Date prise:</b> {c.datePrise}</p>
        <p><b>Date restitution:</b> {c.dateRestitution}</p>
  </div>
))}
    </div>
  );
}