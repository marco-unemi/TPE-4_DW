const notFound = (req, res, next) => {
  res.status(404).json({ message: `Ruta no encontrada - ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === 11000) {
    return res.status(400).json({ message: "El email ya esta registrado" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  return res.status(500).json({ message: "Error interno del servidor" });
};

module.exports = { notFound, errorHandler };
