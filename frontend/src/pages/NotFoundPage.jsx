import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1>404</h1>
        <p>La pagina que buscas no existe.</p>
        <p className="auth-alt">
          <Link to="/">Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}

export default NotFoundPage;
