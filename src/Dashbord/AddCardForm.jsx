import React, { useState, useEffect } from "react";
import "./Addcardform.css";
const AddCardForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    image: null,
    text: "",
    url: "",
    note: "",
  });

  const [cards, setCards] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [originalName, setOriginalName] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    fetch(`http://${API_URL}/backend/public/data.php`)
      .then((res) => res.json())
      .then((data) => setCards(data.contacts || []))
      .catch((err) => console.error("Erreur de chargement JSON:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    if (isEditing) {
      data.append("originalName", originalName);
      const response = await fetch(`http://${API_URL}/backend/update_card.php`, {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        alert("Carte modifiée !");
        setIsEditing(false);
        setOriginalName("");
      } else {
        alert("Erreur lors de la modification.");
      }
    } else {
      const response = await fetch(`http://${API_URL}/backend/save_card.php`, {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        alert("Carte ajoutée !");
      } else {
        alert("Erreur lors de l'ajout.");
      }
    }

    setFormData({
      name: "",
      contact: "",
      image: null,
      text: "",
      url: "",
      note: "",
    });

    // Recharge les cartes
    const updated = await fetch(`http://${API_URL}/backend/public/data.php`).then((res) => res.json());
    setCards(updated.contacts || []);
  };

  const handleDelete = async (name) => {
    const response = await fetch(`http://${API_URL}/backend/delete_card.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (response.ok) {
      alert("Carte supprimée");
      setCards(cards.filter((card) => card.name !== name));
    } else {
      alert("Erreur de suppression");
    }
  };

  const handleEdit = (card) => {
    setFormData({
      name: card.name,
      contact: card.contact,
      image: null, // Image modifiable mais pas préchargée
      text: card.text,
      url: card.url,
      note: card.note,
    });
    setOriginalName(card.name);
    setIsEditing(true);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="add-card-form" encType="multipart/form-data">
        <input name="name" placeholder="Nom" value={formData.name} onChange={handleChange} required />
        <input name="contact" placeholder="Contact" value={formData.contact} onChange={handleChange} required />
        <input type="file" name="image" accept="image/*" onChange={handleChange} />
        <input name="text" placeholder="Texte" value={formData.text} onChange={handleChange} required />
        <input name="url" placeholder="Lien" value={formData.url} onChange={handleChange} required />
        <div className="note-and-button">
  <input name="note" placeholder="Note (optionnel)" value={formData.note} onChange={handleChange} />
  <button type="submit">{isEditing ? "Modifier" : "Ajouter"} la carte</button>
</div>
      </form>

      <h2>Cartes existantes</h2>
      <table border="1" style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Contact</th>
            <th>Texte</th>
            <th>URL</th>
            <th>Note</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => (
            <tr key={card.name}>
              <td>{card.name}</td>
              <td>{card.contact}</td>
              <td>{card.text}</td>
              <td>
                <a href={card.url} target="_blank" rel="noreferrer">
                  Voir lien
                </a>
              </td>
              <td>{card.note}</td>
             <td>
  <div className="action-buttons">
    <button onClick={() => handleDelete(card.name)}>Supprimer</button>
    <button onClick={() => handleEdit(card)}>Modifier</button>
  </div>
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default AddCardForm;
