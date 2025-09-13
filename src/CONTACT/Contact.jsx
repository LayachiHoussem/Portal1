import React, { useState, useEffect, useMemo } from "react";
import "./contactsty.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope, faBriefcase, faUser, faFax, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import man from '../assets/user.jpg';

// 🔍 Composant SearchBar
const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <div className="search">
    <label htmlFor="searchInput">
      <h2>Rechercher</h2>
    </label>
    <input
      type="text"
      id="searchInput"
      placeholder="Nom ou Titre"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
);

// 📇 Composant ContactCard
const ContactCard = ({ contact }) => (
  <li className="contact-card_app">
    <img src={man} alt={contact.name} />
    <div className="details_app">
      <span className="name">
        <FontAwesomeIcon icon={faUser} /> {contact.name}
      </span>
      <span className="title">
        <FontAwesomeIcon icon={faBriefcase} /> {contact.title}
      </span>
      <a className="phone" href={`tel:${contact.phone}`}>
        <FontAwesomeIcon icon={faPhone} /> {contact.phone}
      </a>
      <a className="FAX" href={`tel:${contact.fax}`}>
        <FontAwesomeIcon icon={faFax} /> {contact.fax}
      </a>
      <a className="email" href={`mailto:${contact.email}`}>
        <FontAwesomeIcon icon={faEnvelope} /> {contact.email}
      </a>
    </div>
  </li>
);

// 📜 Composant ContactList
const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const contactsPerPage = 12;

  // Charge contacts depuis JSON
  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost/backend/public/contacts.json");
      if (!response.ok) throw new Error("Erreur lors du chargement des contacts");

      const data = await response.json();
      const uniqueContacts = Array.from(
        new Map(data.contacts.map((contact) => [contact.name.toLowerCase(), contact])).values()
      );

      setContacts(uniqueContacts);
      setError(null);
    } catch (err) {
      setError(err.message);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Revenir à la page 1 à chaque recherche
  }, [searchTerm]);

  // Fonction synchroniser : appelle le backend PHP
  const syncContacts = async () => {
    setSyncing(true);
    setSyncMessage("Synchronisation en cours...");

    try {
      const response = await fetch("http://localhost/backend/sync_ad.php");
      if (!response.ok) throw new Error("Erreur lors de la synchronisation");

      const result = await response.json();
      setSyncMessage(result.message || "Synchronisation terminée");
      await loadContacts(); // Recharge la liste
    } catch (err) {
      setSyncMessage("Erreur de synchronisation : " + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const normalize = (str) =>
    (str || "")
      .toLowerCase()
      .normalize("NFD") // décompose accents
      .replace(/\p{Diacritic}/gu, "") // supprime accents
      .replace(/[’']/g, "'"); // normalise apostrophes

  const filteredContacts = useMemo(() => {
    const lowerSearch = normalize(searchTerm);
    return contacts.filter(({ name, title }) =>
      normalize(name).includes(lowerSearch) || normalize(title).includes(lowerSearch)
    );
  }, [contacts, searchTerm]);

  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const startIndex = (currentPage - 1) * contactsPerPage;
  const currentContacts = filteredContacts.slice(startIndex, startIndex + contactsPerPage);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (loading) return <p>Chargement des contacts...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div className="contact-list-wrapper">
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <button onClick={syncContacts} disabled={syncing} style={{ margin: "10px 0" }}>
        <FontAwesomeIcon icon={faSyncAlt} spin={syncing} /> {syncing ? "Synchronisation..." : "🔄 Synchroniser"}
      </button>
      <p>{syncMessage}</p>

      <div className="container_app">
        <ul className="cards_app">
          {currentContacts.length > 0 ? (
            currentContacts.map((contact) => <ContactCard key={contact.name} contact={contact} />)
          ) : (
            <p>Aucun contact trouvé.</p>
          )}
        </ul>
      </div>

      {filteredContacts.length > contactsPerPage && (
        <div className="pagination_controls">
          <button onClick={handlePrev} disabled={currentPage === 1}>
            ◀ Précédent
          </button>
          <span>
            Page {currentPage} sur {totalPages}
          </span>
          <button onClick={handleNext} disabled={currentPage === totalPages}>
            Suivant ▶
          </button>
        </div>
      )}
    </div>
  );
};

// 🌟 Composant principal Contact
const Contact = () => (
  <div>
    <ContactList />
  </div>
);

export default Contact;
