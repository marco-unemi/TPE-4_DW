import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <span className="navbar-brand">TPE#4 Usuarios</span>

      {auth.isAuthenticated && (
        <div className="navbar-user">
          <span className="navbar-username">{auth.usuario?.nombre || auth.usuario?.email}</span>
          <button type="button" className="btn btn-secondary" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      )}
    </header>
  );
}

export default Navbar;
