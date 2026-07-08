import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function OAuthCallbackPage() {
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      setError("No se recibio un token valido desde Google.");
      return;
    }

    localStorage.setItem("token", token);

    api
      .get("/auth/me")
      .then(({ data }) => {
        auth.login(token, data);
        navigate("/usuarios");
      })
      .catch(() => {
        localStorage.removeItem("token");
        setError("No se pudo completar el inicio de sesion con Google.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="auth-page">
        <div className="card auth-card">
          <h1>Error de autenticacion</h1>
          <p className="alert alert-error">{error}</p>
          <p className="auth-alt">
            <Link to="/login">Volver a iniciar sesion</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Completando inicio de sesion...</h1>
        <p>Por favor espera un momento.</p>
      </div>
    </div>
  );
}

export default OAuthCallbackPage;
