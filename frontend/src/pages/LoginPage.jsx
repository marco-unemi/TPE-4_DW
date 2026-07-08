import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const googleAuthUrl = `${import.meta.env.VITE_API_URL}/auth/google`;

function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      auth.login(data.token, data.usuario);
      navigate("/usuarios");
    } catch (err) {
      const message =
        err.response?.data?.message || "No se pudo iniciar sesion. Intenta nuevamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>Iniciar sesion</h1>

        {error && <p className="alert alert-error">{error}</p>}

        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span>Contrasena</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </label>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <a className="btn btn-google" href={googleAuthUrl}>
          Continuar con Google
        </a>

        <p className="auth-alt">
          No tenes cuenta? <Link to="/register">Registrate</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
