import React, { useState, useEffect } from "react";
import axios from "axios";

const UploadForm = () => {
  const [formData, setFormData] = useState({
    department: "",
    folderPath: "",
    title: "",
    description: "",
    file: null,
  });

  const [departments, setDepartments] = useState([]);
  const [subFolders, setSubFolders] = useState([]);
  const [subSubFolders, setSubSubFolders] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost/backend/get_departments.php")
      .then((res) => {
        if (res.data.departments) {
          setDepartments(res.data.departments);
        }
      })
      .catch((err) =>
        console.error("Erreur de chargement des départements :", err)
      );
  }, []);

  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    setFormData({ ...formData, department, folderPath: "" });
    setSubFolders([]);
    setSubSubFolders([]);

    if (department) {
      axios
        .get(`http://localhost/backend/getupload_subfolders.php?department=${department}`)
        .then((res) => {
          setSubFolders(res.data.subFolders || []);
        })
        .catch((err) => console.error("Erreur chargement sous-dossiers", err));
    }
  };

  const handleFolderChange = (e) => {
    const folder = e.target.value;
    setFormData({ ...formData, folderPath: folder });
    setSubSubFolders([]);

    if (folder) {
      axios
        .get(`http://localhost/backend/getupload_subfolders.php?department=${formData.department}&folder=${folder}`)
        .then((res) => {
          setSubSubFolders(res.data.subFolders || []);
        })
        .catch((err) => console.error("Erreur chargement sous-sous-dossiers", err));
    }
  };

  const handleSubSubFolderChange = (e) => {
    const subFolder = e.target.value;
    if (subFolder) {
      setFormData({
        ...formData,
        folderPath: `${formData.folderPath}/${subFolder}`,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.department || !formData.title || !formData.description || !formData.file) {
      alert("Veuillez remplir les champs obligatoires.");
      return;
    }

    const data = new FormData();
    data.append("department", formData.department);
    data.append("folderPath", formData.folderPath); // peut être vide
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("file", formData.file);

    try {
      const response = await axios.post("http://localhost/backend/upload.php", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message || response.data.error);
    } catch (error) {
      console.error("Erreur upload:", error);
      alert("Erreur lors de l'envoi du fichier.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Département *:</label>
        <select value={formData.department} onChange={handleDepartmentChange} required>
          <option value="">Sélectionner un département</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Sous-département :</label>
        <select value={formData.folderPath.split("/")[0] || ""} onChange={handleFolderChange} disabled={!subFolders.length}>
          <option value="">Aucun</option>
          {subFolders.map((f) => (
            <option key={f.name} value={f.name}>{f.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Sous-sous-dossier :</label>
        <select value={formData.folderPath.split("/")[1] || ""} onChange={handleSubSubFolderChange} disabled={!subSubFolders.length}>
          <option value="">Aucun</option>
          {subSubFolders.map((s) => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Titre *:</label>
        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
      </div>

      <div>
        <label>Description *:</label>
        <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
      </div>

      <div>
        <label>Fichier *:</label>
        <input type="file" onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })} required />
      </div>

      <button type="submit">Uploader</button>
    </form>
  );
};

export default UploadForm;
