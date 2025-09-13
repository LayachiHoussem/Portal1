import React, { useState } from "react";
import "./uploadDocument.css";

const UploadDocument = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("IT");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title || !description || !file || !department) {
      setMessage("Tous les champs sont requis.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("department", department);
    formData.append("file", file);

    try {
      const response = await fetch("/upload.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      console.error("Erreur lors de l'upload :", error);
      setMessage("Erreur lors de l'upload.");
    }
  };

  return (
    <div className="upload-container">
      <h2>📤 Upload de Document</h2>
      <form onSubmit={handleUpload}>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
          <option value="Instruction">Instruction</option>
        </select>
        <input
          type="text"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          accept=".doc,.docx,.pdf"
        />
        <button type="submit">Uploader</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default UploadDocument;
