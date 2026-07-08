const Usuario = require("../models/Usuario");

const getUsuarios = async (req, res, next) => {
  try {
    const usuarios = await Usuario.find();
    return res.status(200).json(usuarios);
  } catch (err) {
    return next(err);
  }
};

const getUsuarioById = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json(usuario);
  } catch (err) {
    return next(err);
  }
};

const updateUsuario = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const { nombre, email, password } = req.body;

    if (nombre !== undefined) usuario.nombre = nombre;
    if (email !== undefined) usuario.email = email;
    if (password !== undefined) usuario.password = password;

    await usuario.save();

    const usuarioSinPassword = usuario.toObject();
    delete usuarioSinPassword.password;

    return res.status(200).json(usuarioSinPassword);
  } catch (err) {
    return next(err);
  }
};

const deleteUsuario = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({ message: "Usuario eliminado" });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getUsuarios, getUsuarioById, updateUsuario, deleteUsuario };
