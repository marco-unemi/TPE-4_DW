const Usuario = require("../models/Usuario");
const generateToken = require("../utils/generateToken");

const register = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: "Nombre, email y password son requeridos" });
    }

    const usuario = await Usuario.create({ nombre, email, password });

    const token = generateToken(usuario);

    const usuarioSinPassword = usuario.toObject();
    delete usuarioSinPassword.password;

    return res.status(201).json({ token, usuario: usuarioSinPassword });
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y password son requeridos" });
    }

    const usuario = await Usuario.findOne({ email }).select("+password");

    if (!usuario) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    if (!usuario.password) {
      return res.status(400).json({
        message: "Esta cuenta usa Google. Inicia sesion con Google.",
      });
    }

    const esValida = await usuario.compararPassword(password);

    if (!esValida) {
      return res.status(401).json({ message: "Credenciales invalidas" });
    }

    const token = generateToken(usuario);

    const usuarioSinPassword = usuario.toObject();
    delete usuarioSinPassword.password;

    return res.status(200).json({ token, usuario: usuarioSinPassword });
  } catch (err) {
    return next(err);
  }
};

const googleCallback = (req, res) => {
  const token = generateToken(req.user);
  return res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
};

const me = async (req, res, next) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json(usuario);
  } catch (err) {
    return next(err);
  }
};

module.exports = { register, login, googleCallback, me };
