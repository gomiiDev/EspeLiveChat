const express = require("express");
const router = express.Router();
const path = require("path");
const isLoggedIn = require("../middleware/isLoggedIn");
const User = require("../models/User");
const views = path.join(__dirname, "/../views");

router.get("/", isLoggedIn, (req, res) => {
  res.sendFile(views + "/index.html");
});

router.get("/register", (req, res) => {
  res.sendFile(views + "/register.html");
});

router.post("/register", async (req, res) => {
  const { username } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ error: "El nombre de usuario es obligatorio" });
  }

  const sanitized = username.trim();

  try {
    await User.findOneAndUpdate(
      { username: sanitized },
      { username: sanitized },
      { upsert: true, new: true, runValidators: true }
    );

    res.cookie("username", sanitized, { httpOnly: false, sameSite: "lax" });
    res.status(200).json({ ok: true });
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)[0].message;
      return res.status(400).json({ error: message });
    }
    console.error("Error en POST /register:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
