import React, { useEffect, useState } from "react";

const UploadFile = () => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({ department: "", title: "", description: "" });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetch("/documents.json")
      .then(res => res.json())
      .then(data => setDepartments(Object.keys(data.departments)));
  }, []);

  const handleSubmit = () => {
    const data = new FormData();
    data.append("department", formData.department);
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("file", file);

    fetch("http://localhost/ton_projet_php/upload.php", {
      method: "POST",
      body: data
    })
      .then(res => res.json())
      .then(res => alert(res.message));
  };

  return (
    <div>
      <h2>Ajouter un document</h2>
      <select onChange={e => setFormData({ ...formData, department: e.target.value })}>
        <option value="">Choisir un département</option>
        {departments.map(dep => (
          <option key={dep} value={dep}>{dep}</option>
        ))}
      </select>
      <input placeholder="Titre" onChange={e => setFormData({ ...formData, title: e.target.value })} />
      <textarea placeholder="Description" onChange={e => setFormData({ ...formData, description: e.target.value })} />
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleSubmit}>Uploader</button>
    </div>
  );
};

export default UploadFile;
