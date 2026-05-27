const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "El nombre de usuario es obligatorio"],
      unique: true,
      trim: true,
      minlength: [2, "El nombre de usuario debe tener al menos 2 caracteres"],
      maxlength: [30, "El nombre de usuario no puede superar los 30 caracteres"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
