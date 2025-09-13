import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageFiles = () => {
  const [documents, setDocuments] = useState([]);

  const fetchData = async () => {
    const res = await axios.get(`http://${API_URL}/backend/upload.php`);
    const allDocs = [];
    for (const [dep, content] of Object.entries(res.data.departments)) {
      content.documents.forEach((doc, index) => {
        allDocs.push({ ...doc, department: dep, index });
      });
    }
    setDocuments(allDocs);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (dep, index) => {
    try {
      await axios.post(`http://${API_URL}/backend/delete_file.php`, { department: dep, index });
      alert("le dep",dep);
      alert("le index",index);
      alert("Fichier supprimé");
      fetchData();
    } catch (err) {
      alert("Erreur de suppression");
    }
  };

  return (
    <div>
      <h3>Gérer les fichiers</h3>
      <ul>
        {documents.map((doc, idx) => (
          <li key={idx}>
            <strong>{doc.title}</strong> - {doc.department}
            <button onClick={() => handleDelete(doc.department, doc.index)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageFiles;
