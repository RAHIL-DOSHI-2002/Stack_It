const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },      // hashed via bcrypt
  role:     { type: String, enum: ["user","admin"], default: "user" }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
