const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("./config/passport");

const authRoutes = require("./routes/authRoutes");
const usuarioRoutes = require("./routes/usuarioRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(morgan("dev"));
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
