import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import UsuarioForm from "../components/UsuarioForm";
import UsuarioTable from "../components/UsuarioTable";
import { useAuth } from "../context/AuthContext";

function UsuariosDashboard() {
  const auth = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editError, setEditError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const loadUsuarios = async () => {
    setLoading(true);
    setListError("");
    try {
      const { data } = await api.get("/usuarios");
      setUsuarios(data);
    } catch (err) {
      const message = err.response?.data?.message || "No se pudieron cargar los usuarios.";
      setListError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const handleCreate = async (payload) => {
    setCreateError("");
    setCreating(true);
    try {
      await api.post("/auth/register", payload);
      await loadUsuarios();
    } catch (err) {
      const message = err.response?.data?.message || "No se pudo crear el usuario.";
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleStartEdit = (id) => {
    setEditError("");
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditError("");
  };

  const handleUpdate = async (id, payload) => {
    setEditError("");
    setEditSubmitting(true);
    try {
      await api.put(`/usuarios/${id}`, payload);
      setEditingId(null);
      await loadUsuarios();
    } catch (err) {
      const message = err.response?.data?.message || "No se pudo actualizar el usuario.";
      setEditError(message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Seguro que queres eliminar este usuario?");
    if (!confirmed) return;

    try {
      await api.delete(`/usuarios/${id}`);
      await loadUsuarios();
    } catch (err) {
      const message = err.response?.data?.message || "No se pudo eliminar el usuario.";
      window.alert(message);
    }
  };

  return (
    <div className="page">
      <Navbar />

      <main className="container">
        <section className="card">
          <h1>Usuarios</h1>
          <p>
            Sesion iniciada como <strong>{auth.usuario?.nombre}</strong> ({auth.usuario?.email})
          </p>
        </section>

        <section className="card">
          <h2>Agregar usuario</h2>
          <UsuarioForm mode="create" onSubmit={handleCreate} submitting={creating} error={createError} />
        </section>

        <section className="card">
          <h2>Listado de usuarios</h2>
          {loading && <p>Cargando usuarios...</p>}
          {listError && <p className="alert alert-error">{listError}</p>}
          {!loading && !listError && (
            <UsuarioTable
              usuarios={usuarios}
              editingId={editingId}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              editSubmitting={editSubmitting}
              editError={editError}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default UsuariosDashboard;
