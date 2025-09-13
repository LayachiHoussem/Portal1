import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Importation de BrowserRouter

import Home from "./Home";
//import Contact from "./CONTACT/Contact";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
  <BrowserRouter>
      <Home /> {/* OU <Contact /> si c'est ton fichier principal */}
  </BrowserRouter>
  </React.StrictMode>
);
