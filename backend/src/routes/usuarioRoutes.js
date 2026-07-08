const express = require("express");
const {
  getUsuarios,
  getUsuarioById,
  updateUsuario,
  deleteUsuario,
} = require("../controllers/usuarioController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.use(verifyToken);

router.get("/", getUsuarios);
router.get("/:id", getUsuarioById);
router.put("/:id", updateUsuario);
router.delete("/:id", deleteUsuario);

module.exports = router;
