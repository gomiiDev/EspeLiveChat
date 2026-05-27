const express = require("express");
const router = express.Router();
const path = require("path");
const isLoggedIn = require("../middleware/isLoggedIn");
const User = require("../models/User");

const views = path.join(__dirname, "/../views");

const COOKIE_OPTIONS = { httpOnly: false, sameSite: "lax" };

const isAlreadyLoggedIn = (req, res, next) => {
  if (req.cookies.username) return res.redirect("/");
  next();
};

const getFirstValidationMessage = (error) =>
  Object.values(error.errors)[0].message;

// ── Chat ────────────────────────────────────────────────────────────────────

router.get("/", isLoggedIn, (req, res) => {
  res.sendFile(path.join(views, "index.html"));
});

// ── Register ─────────────────────────────────────────────────────────────────

router.get("/register", isAlreadyLoggedIn, (req, res) => {
  res.sendFile(path.join(views, "register.html"));
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username?.trim() || !password) {
    return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });
  }

  const sanitizedUsername = username.trim();

  try {
    const exists = await User.findOne({ username: sanitizedUsername });
    if (exists) {
      return res.status(409).json({ error: "El nombre de usuario ya está en uso" });
    }

    await User.create({ username: sanitizedUsername, password });

    res.cookie("username", sanitizedUsername, COOKIE_OPTIONS);
    res.status(201).json({ ok: true });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: getFirstValidationMessage(error) });
    }
    console.error("Error en POST /register:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────────

router.get("/login", isAlreadyLoggedIn, (req, res) => {
  res.sendFile(path.join(views, "login.html"));
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username?.trim() || !password) {
    return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });
  }

  const sanitizedUsername = username.trim();

  try {
    const user = await User.findOne({ username: sanitizedUsername }).select("+password");

    if (!user) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    res.cookie("username", user.username, COOKIE_OPTIONS);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error en POST /login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
