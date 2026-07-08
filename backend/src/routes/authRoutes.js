const express = require("express");
const passport = require("passport");
const { register, login, googleCallback, me } = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  googleCallback
);

router.get("/me", verifyToken, me);

module.exports = router;
