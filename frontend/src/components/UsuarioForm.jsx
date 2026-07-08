import { useState } from "react";

const emptyForm = { nombre: "", email: "", password: "" };

function UsuarioForm({ mode = "create", initialValues, onSubmit, onCancel, submitting, error }) {
  const [form, setForm] = useState(() => ({
    nombre: initialValues?.nombre || "",
    email: initialValues?.email || "",
    password: "",
  }));

  const isEdit = mode === "edit";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEdit) {
      const payload = { nombre: form.nombre, email: form.email };
      if (form.password) payload.password = form.password;
      await onSubmit(payload);
    } else {
      await onSubmit(form);
      setForm(emptyForm);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form form-inline">
      {error && <p className="alert alert-error">{error}</p>}

      <label className="field">
        <span>Nombre</span>
        <input
          type="text"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />
      </label>

      <label className="field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </label>

      <label className="field">
        <span>{isEdit ? "Nueva contrasena (opcional)" : "Contrasena"}</span>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required={!isEdit}
          autoComplete="new-password"
        />
      </label>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Agregar usuario"}
        </button>
        {isEdit && onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default UsuarioForm;
