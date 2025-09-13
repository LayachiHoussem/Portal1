import React, { useState, useEffect } from "react";
import "./uploadfile.css";

const UploadFile = () => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({ department: "", title: "", description: "" });
  const [file, setFile] = useState(null);

  // Fetch departments from a JSON file or endpoint
  useEffect(() => {
    fetch("/documents.json")
      .then(res => res.json())
      .then(data => setDepartments(Object.keys(data.departments))); // Assuming departments are stored in JSON file
  }, []);

  const handleSubmit = async () => {
    if (!formData.department || !formData.title || !formData.description || !file) {
      alert("Please fill in all fields and choose a file.");
      return;
    }

    const data = new FormData();
    data.append("department", formData.department);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("file", file);

    try {
      const response = await fetch("http://localhost/xamppv2/htdocs/portal/upload.php", {
        method: "POST",
        body: data
      });

      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file.");
    }
  };

  return (
    <div className="upload-container">
      <h2>Ajouter un document</h2>
      <select onChange={e => setFormData({ ...formData, department: e.target.value })}>
        <option value="">Choisir un département</option>
        {departments.map(dep => (
          <option key={dep} value={dep}>{dep}</option>
        ))}
      </select>
      <input
        placeholder="Titre"
        onChange={e => setFormData({ ...formData, title: e.target.value })}
      />
      <textarea
        placeholder="Description"
        onChange={e => setFormData({ ...formData, description: e.target.value })}
      />
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleSubmit}>Uploader</button>
    </div>
  );
};

export default UploadFile;
