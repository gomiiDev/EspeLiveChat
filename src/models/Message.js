const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "El nombre de usuario es obligatorio"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "El mensaje no puede estar vacío"],
      trim: true,
      maxlength: [1000, "El mensaje no puede superar los 1000 caracteres"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
