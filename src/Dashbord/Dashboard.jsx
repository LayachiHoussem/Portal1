import React, { useState } from "react";
import UploadForm from "./UploadForm";
import AddDepartmentForm from "./AddDepartmentForm";

import "./dashboard.css";

import AddCardForm from "./AddCardForm";

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState("upload");

  const renderComponent = () => {
    switch (activeComponent) {
      case "upload":
        return <UploadForm />;
      case "addDepartment":
        return <AddDepartmentForm />;
      case "manage":
        return <ManageFiles />;
	case "addCard":
	  return <AddCardForm />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2>Menu</h2>
        <button onClick={() => setActiveComponent("upload")}>Uploader</button>
        <button onClick={() => setActiveComponent("addDepartment")}>Ajouter Département</button>
      	<button onClick={() => setActiveComponent("addCard")}>Ajouter Carte</button>

      </aside>
      <main className="main-content">
        {renderComponent()}
      </main>
    </div>
  );
};

export default Dashboard;
