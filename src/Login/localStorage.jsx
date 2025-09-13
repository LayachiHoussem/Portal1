import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

const Dashboard = () => {
  const history = useHistory();

  useEffect(() => {
    // Check if the user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      history.push("/login"); // Redirect to login page if not logged in
    }
  }, [history]);

  const handleLogout = () => {
    localStorage.removeItem("user"); // Remove the user from localStorage
    history.push("/login"); // Redirect to login page
  };

  return (
    <div>
      <h2>Welcome to the Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
