import React, { useState, useEffect } from "react";
import axios from "axios";

const AddDepartmentForm = () => {
  const [rootFolder, setRootFolder] = useState(""); // niveau 1
  const [selectedRoot, setSelectedRoot] = useState(""); // racine pour niveau 2
  const [subFolder, setSubFolder] = useState(""); // niveau 2
  const [selectedSubFolder, setSelectedSubFolder] = useState(""); // sous-dossier pour niveau 3
  const [subSubFolder, setSubSubFolder] = useState(""); // niveau 3
  const [departments, setDepartments] = useState([]); // liste des départements
  const [subFolders, setSubFolders] = useState([]); // liste des sous-dossiers pour une racine donnée
  const [subSubFolders, setSubSubFolders] = useState([]); // liste des sous-sous-dossiers pour un sous-dossier

  // Charger la liste des départements existants
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`http://${API_URL}/backend/get_departments.php`);
        setDepartments(response.data.departments || []);
      } catch (err) {
        console.error("Erreur lors du chargement des départements", err);
      }
    };
    fetchDepartments();
  }, []);

  // Charger les sous-dossiers d'une racine sélectionnée
  useEffect(() => {
    if (selectedRoot) {
      const fetchSubFolders = async () => {
        try {
          const response = await axios.get(`http://${API_URL}/backend/get_subfolders.php?root=${selectedRoot}`);
          setSubFolders(response.data.subfolders || []);
        } catch (err) {
          console.error("Erreur lors du chargement des sous-dossiers", err);
        }
      };
      fetchSubFolders();
    } else {
      setSubFolders([]); // Réinitialiser si aucune racine n'est sélectionnée
    }
  }, [selectedRoot]);

  // Charger les sous-sous-dossiers d'un sous-dossier sélectionné
  useEffect(() => {
    if (selectedRoot && selectedSubFolder) {
      const fetchSubSubFolders = async () => {
        try {
          const response = await axios.get(`http://${API_URL}/backend/get_subfolders.php?root=${selectedRoot}/${selectedSubFolder}`);
          setSubSubFolders(response.data.subfolders || []);
        } catch (err) {
          console.error("Erreur lors du chargement des sous-sous-dossiers", err);
        }
      };
      fetchSubSubFolders();
    } else {
      setSubSubFolders([]); // Réinitialiser si aucune sous-dossier n'est sélectionné
    }
  }, [selectedRoot, selectedSubFolder]);

  // Ajouter une racine (niveau 1)
  const handleAddRoot = async (e) => {
    e.preventDefault();
    if (!rootFolder.trim()) {
      return alert("Veuillez entrer un nom pour le dossier racine.");
    }

    try {
      const response = await axios.post(`http://${API_URL}/backend/Addepar.php`, {
        name: rootFolder.trim(),
      });
      alert("✅ " + response.data.message);
      window.location.reload();
    } catch (err) {
      alert("❌ Erreur : " + (err.response?.data?.error || "Erreur serveur"));
    }
  };

  // Ajouter un sous-dossier (niveau 2)
  const handleAddSubFolder = async (e) => {
    e.preventDefault();
    if (!selectedRoot || !subFolder.trim()) {
      return alert("Veuillez sélectionner la racine et entrer un sous-dossier.");
    }

    const fullPath = `${selectedRoot}/${subFolder.trim()}`;

    try {
      const response = await axios.post(`http://${API_URL}/backend/Addepar.php`, {
        name: fullPath,
      });
      alert("✅ " + response.data.message);
      window.location.reload();
    } catch (err) {
      alert("❌ Erreur : " + (err.response?.data?.error || "Erreur serveur"));
    }
  };

  // Ajouter un sous-sous-dossier (niveau 3)
  const handleAddSubSubFolder = async (e) => {
    e.preventDefault();
    if (!selectedRoot || !selectedSubFolder || !subSubFolder.trim()) {
      return alert("Veuillez sélectionner la racine, le sous-dossier et entrer un sous-sous-dossier.");
    }

    const fullPath = `${selectedRoot}/${selectedSubFolder.trim()}/${subSubFolder.trim()}`;

    try {
      const response = await axios.post(`http://${API_URL}/backend/Addepar.php`, {
        name: fullPath,
      });
      alert("✅ " + response.data.message);
      window.location.reload();
    } catch (err) {
      alert("❌ Erreur : " + (err.response?.data?.error || "Erreur serveur"));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "30px", maxWidth: "700px" }}>
      {/* Niveau 1 - Ajouter Dossier Racine */}
      <form onSubmit={handleAddRoot} style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#e3f2fd", padding: "15px", borderRadius: "8px" }}>
        <h3>➊ Créer un Dossier Racine</h3>
        <input
          type="text"
          placeholder="Nom du dossier racine (ex: IT)"
          value={rootFolder}
          onChange={(e) => setRootFolder(e.target.value)}
          required
        />
        <button type="submit" style={{ backgroundColor: "#4CAF50", color: "#fff" }}>
          ➕ Créer Racine
        </button>
      </form>

      <hr />

      {/* Niveau 2 - Ajouter Sous-Dossier */}
      <form onSubmit={handleAddSubFolder} style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#e8f5e9", padding: "15px", borderRadius: "8px" }}>
        <h3>➋ Créer un Sous-Dossier</h3>
        <select
          value={selectedRoot}
          onChange={(e) => setSelectedRoot(e.target.value)}
          required
        >
          <option value="">-- Sélectionner une racine --</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Nom du sous-dossier (ex: Frontend)"
          value={subFolder}
          onChange={(e) => setSubFolder(e.target.value)}
          required
        />
        <button type="submit" style={{ backgroundColor: "#9C27B0", color: "#fff" }}>
          ➕ Créer Sous-Dossier
        </button>
      </form>

      <hr />

      {/* Niveau 3 - Ajouter Sous-Sous-Dossier */}
      <form onSubmit={handleAddSubSubFolder} style={{ display: "flex", flexDirection: "column", gap: "10px", backgroundColor: "#f1f8e9", padding: "15px", borderRadius: "8px" }}>
        <h3>➌ Créer un Sous-Sous-Dossier</h3>
        <select
          value={selectedRoot}
          onChange={(e) => setSelectedRoot(e.target.value)}
          required
        >
          <option value="">-- Sélectionner une racine --</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <select
          value={selectedSubFolder}
          onChange={(e) => setSelectedSubFolder(e.target.value)}
          required
          disabled={!selectedRoot}
        >
          <option value="">-- Sélectionner un sous-dossier --</option>
          {subFolders.map((subFolder) => (
            <option key={subFolder} value={subFolder}>
              {subFolder}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Nom du sous-sous-dossier (ex: Admin)"
          value={subSubFolder}
          onChange={(e) => setSubSubFolder(e.target.value)}
          required
        />
        <button type="submit" style={{ backgroundColor: "#f44336", color: "#fff" }}>
          ➕ Créer Sous-Sous-Dossier
        </button>
      </form>
    </div>
  );
};

export default AddDepartmentForm;
