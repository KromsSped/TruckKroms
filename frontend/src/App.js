// VERSION PRO COMPLETE (Frontend amélioré)
import { useState, useEffect } from "react";

const API = "https://truckkroms.onrender.com";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role") || "");

  if (!token) return <Login setToken={setToken} setRole={setRole} />;

  return <Dashboard token={token} role={role} setToken={setToken} />;
}

function Login({ setToken, setRole }) {
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
      localStorage.setItem("role", data.role);
      setToken(data.token);
      setRole(data.role);
    } else alert(data.error);
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-4">Connexion</h2>
      <input className="border p-2 w-full mb-2" placeholder="Utilisateur" onChange={e => setUsername(e.target.value)} />
      <input type="password" className="border p-2 w-full mb-2" placeholder="Mot de passe" onChange={e => setPassword(e.target.value)} />
      <button className="bg-blue-500 text-white p-2 w-full" onClick={login}>Se connecter</button>
    </div>
  );
}

function Dashboard({ token, role, setToken }) {
  const [checklists, setChecklists] = useState([]);

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    const res = await fetch(API + "/checklist", {
      headers: { Authorization: "Bearer " + token }
    });
    const data = await res.json();
    setChecklists(data);
  };

  const incidents = checklists.filter(c => c.etat === "incident").length;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={() => { localStorage.clear(); setToken(null); }} className="bg-red-500 text-white px-3 py-1">Logout</button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white shadow p-3 rounded">Total: {checklists.length}</div>
        <div className="bg-white shadow p-3 rounded text-red-500">Incidents: {incidents}</div>
      </div>

      <ChecklistForm token={token} refresh={fetchChecklists} />
      <ChecklistList checklists={checklists} />
    </div>
  );
}

function ChecklistForm({ token, refresh }) {
  const [camion, setCamion] = useState("");
  const [chauffeur, setChauffeur] = useState("");
  const [etat, setEtat] = useState("OK");
  const [photo, setPhoto] = useState(null);

  const submit = async () => {
    const formData = new FormData();
    formData.append("camion", camion);
    formData.append("chauffeur", chauffeur);
    formData.append("etat", etat);
    if (photo) formData.append("photo", photo);

    const res = await fetch(API + "/checklist", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData
    });

    if (res.ok) {
      alert("Envoyé");
      setCamion("");
      setChauffeur("");
      setPhoto(null);
      refresh();
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded mb-4">
      <h2 className="font-bold mb-2">Nouvelle mission</h2>

      <input className="border p-2 w-full mb-2" placeholder="Camion" value={camion} onChange={e => setCamion(e.target.value)} />
      <input className="border p-2 w-full mb-2" placeholder="Chauffeur" value={chauffeur} onChange={e => setChauffeur(e.target.value)} />

      <select className="border p-2 w-full mb-2" value={etat} onChange={e => setEtat(e.target.value)}>
        <option value="OK">OK</option>
        <option value="incident">Incident</option>
      </select>

      <input type="file" accept="image/*" capture="environment" className="mb-2" onChange={e => setPhoto(e.target.files[0])} />

      <button className="bg-green-500 text-white p-2 w-full" onClick={submit}>Envoyer</button>
    </div>
  );
}

function ChecklistList({ checklists }) {
  return (
    <div>
      <h2 className="font-bold mb-2">Historique</h2>
      {checklists.map(c => (
        <div key={c.id} className="border p-3 mb-2 rounded">
          <h3 className="font-semibold">{c.camion} - {c.chauffeur}</h3>
          <p className={c.etat === "incident" ? "text-red-500" : "text-green-500"}>{c.etat}</p>
          {c.photo && (
            <img src={API + "/uploads/" + c.photo} alt="" className="mt-2 rounded" />
          )}
        </div>
      ))}
    </div>
  );
}


// BACKEND (Node.js Express à adapter)
// AJOUT PHOTO (multer)
/*
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/checklist', authenticate, upload.single('photo'), (req, res) => {
  const { camion, chauffeur, etat } = req.body;

  const newChecklist = {
    camion,
    chauffeur,
    etat,
    photo: req.file ? req.file.filename : null,
    date: new Date()
  };

  db.push(newChecklist);
  res.json(newChecklist);
});
*/