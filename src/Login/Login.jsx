// 📦 Imports
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"; 
import illesr from "../assets/Login-amico.png";

// 🌍 Constante API_URL définie hors du composant
const API_URL = import.meta.env.VITE_API_URL;

function Login({ setIsLoggedIn }) {
  // 🔐 États du formulaire
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // 📦 Vérifie s'il y a déjà une session active
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`http://${API_URL}/backend/check_session.php`, {
          credentials: "include",
        });
        const data = await response.json();
        if (data.authenticated) {
          setIsLoggedIn(true);
          navigate("/NewDocument");
        }
      } catch (err) {
        // Aucune session ou erreur silencieuse
      }
    };
    checkSession();
  }, [navigate, setIsLoggedIn]);

  // 🔐 Gestion de la connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://${API_URL}/backend/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.authenticated) {
        localStorage.setItem("authToken", data.token || "dummyToken");
        setIsLoggedIn(true);
        navigate("/NewDocument");
      } else {
        setError(data.message || "Identifiants incorrects");
      }

    } catch (error) {
      console.error("Erreur de connexion :", error);
      setError("Erreur réseau ou serveur");
    }
  };

  // 🖼️ Interface utilisateur
  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-left">
          <img src={illesr} alt="illustration" />
        </div>

        <div className="login-right">
          <h2>Welcome back</h2>
          <form onSubmit={handleLogin} className="login-form">
            <h3>Login your account</h3>
            {error && <p className="error">{error}</p>}

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="show-password-button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
