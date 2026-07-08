const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Usuario = require("../models/Usuario");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let usuario = await Usuario.findOne({ googleId: profile.id });

        if (usuario) {
          return done(null, usuario);
        }

        const email = profile.emails && profile.emails[0] && profile.emails[0].value;

        if (email) {
          usuario = await Usuario.findOne({ email });

          if (usuario) {
            usuario.googleId = profile.id;
            await usuario.save();
            return done(null, usuario);
          }
        }

        usuario = await Usuario.create({
          nombre: profile.displayName,
          email: email,
          googleId: profile.id,
        });

        return done(null, usuario);
      } catch (err) {
        return done(err);
      }
    }
  )
);

module.exports = passport;
