import React, { useEffect, useState } from "react";
import "./App.css";
import {Routes , Route } from "react-router-dom";


const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  console.log("le laddress et ", API_URL);
  useEffect(() => {
    fetch(`http://${API_URL}/backend/public/data.php`)
      .then((response) => response.json())  
      .then((data) => {
        console.log("Fetched contacts:", data.contacts);
        setContacts(data.contacts);
      })
      .catch((error) => console.error("Error loading contacts:", error));
  }, []);

  return (
    <section className="mains">
      <div className="search">
        <label htmlFor="searchInput">
         <h2>Rechercher</h2>
        </label>
        <input
          type="text"
          id="searchInput"
          placeholder="Rechercher par titre"
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
        />
      </div>
      <div className="container">
        <ul className="cards">
          {Array.from(
            new Set(contacts.map((contact) => JSON.stringify(contact)))
          ) // Supprime les doublons
            .map((str) => JSON.parse(str)) // Reconvertir en objet
            .filter((contact) => contact.name.toLowerCase().includes(search))
            .map((contact) => (
              <a
                key={contact.name}
                href={contact.url}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-card-link"
              >
                <li className="contact-card">
  <div className="tooltip">
    {contact.note || "Informations supplémentaires sur ce contact"}
  </div>
  <img src={contact.image} alt={contact.name} />
  <div className="details">
    <span className="name">{contact.name}</span>
    <p>{contact.text}</p>
    <button className="btn">{contact.contact}</button>
  </div>
</li>
              </a>
            ))}
        </ul>
      </div>
    </section>
  );
};



const ContactForm = () => {
  const [formData, setFormData] = useState({
    sender: "",
    subject: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch("`http://${API_URL}:5000/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: formData.sender,
        subject: formData.subject,
        message: formData.description,
      }),
    });
    
    if (response.ok) {
      alert("Message sent successfully!");
      setFormData({ sender: "", subject: "", description: "" });
    } else {
      alert("Failed to send message.");
    }
  };

  return (
    <footer className="footer-container">
      <div className="form-wrapper">
        <h1 className="form-title">Contact Us</h1>
        <div className="form-container">
          <div className="image-section">
            <img
              src="/public/image/Mail sent-amico(1).png"
              alt="Contact Us"
              className="contact-image"
            />
          </div>
          <div className="form-section">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div>
                <label className="form-label">Sender</label>
                <input
                  type="text"
                  name="sender"
                  className="form-input"
                  placeholder="Your name"
                  value={formData.sender}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  name="subject"
                  className="form-input"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  placeholder="Your message"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="none" d="M0 0h24v24H0z"></path>
                  <path
                    fill="currentColor"
                    d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                  ></path>
                </svg>
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
};
const App = () => (
  <div>

    <main>
      <ContactList />
    
    </main>
  </div>
);

export default App;
