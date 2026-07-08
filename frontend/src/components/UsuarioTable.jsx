import UsuarioForm from "./UsuarioForm";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

function UsuarioTable({
  usuarios,
  editingId,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  editSubmitting,
  editError,
}) {
  if (!usuarios.length) {
    return <p>No hay usuarios cargados todavia.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => {
            const isEditing = editingId === usuario._id;

            return (
              <tr key={usuario._id}>
                {isEditing ? (
                  <td colSpan={4}>
                    <UsuarioForm
                      mode="edit"
                      initialValues={usuario}
                      onSubmit={(payload) => onUpdate(usuario._id, payload)}
                      onCancel={onCancelEdit}
                      submitting={editSubmitting}
                      error={editError}
                    />
                  </td>
                ) : (
                  <>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.email}</td>
                    <td>{formatDate(usuario.createdAt)}</td>
                    <td className="table-actions">
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() => onStartEdit(usuario._id)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-small"
                        onClick={() => onDelete(usuario._id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default UsuarioTable;
