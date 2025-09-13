import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate ,useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faAddressBook, faFolder } from '@fortawesome/free-solid-svg-icons';
import './index.css';
import Contact from './CONTACT/Contact';
import App from './APP/App';
import Documents from './Documents/Documents';
import Login from './Login/Login';
import samhaImage from './assets/samha2.png';
import UploadDocument from './UploadDocument';
import UploadForm from './Dashbord/UploadForm';
import Dashboard from './Dashbord/Dashboard';
import NewDocument from './NewDocument/Newdocument';

const Home = () => {
    const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('authToken') ? true : false);
  }, []);
 const currentPath = location.pathname;
  return (
    <div>
      <header>
        <nav>
          <div className="logo">
            <Link to="/">
              <img src={samhaImage} alt="Logo" />
            </Link>
            <Link to="/">
              <h2><a>SAMHA HOME APPLIANCE</a></h2>
            </Link>
          </div>
          <div className="hamburger" onClick={() => document.querySelector(".nav-links").classList.toggle("active")}>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className="nav-links">
            <Link to="/">
              <FontAwesomeIcon icon={faHome} /> Portal
            </Link>
            <Link to="/Documents">
              <FontAwesomeIcon icon={faFolder} /> Documents
            </Link>
            <Link to="/Contact">
              <FontAwesomeIcon icon={faAddressBook} /> My Contacts
            </Link>
             {isLoggedIn && currentPath == '/NewDocument' && (
              <Link to="/NewDocument">
                <FontAwesomeIcon icon={faFolder} /> New Document
              </Link>
            )}
            <Link to="/Login">
              <FontAwesomeIcon icon={faAddressBook} /> Login
            </Link>
          </div>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/Documents" element={<Documents />} />
		
      /*  <Route path="/NewDocument" element={isLoggedIn ? <NewDocument /> : <Navigate to="/Login" />} />*/
        <Route path="/Login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
      </Routes>
    </div>
  );
  <body className={
  isLoginPage ? "login-page" 
  : isAppHome ? "app-home" 
  : "document-main"
} />
}

export default Home;