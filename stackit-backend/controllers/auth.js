const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const User    = require("../models/user");

const router = express.Router();

// ── REGISTER ─────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    
    if (await User.findOne({ username }))
      return res.status(400).json({ message: "Username already taken." });

    
    const hash = await bcrypt.hash(password, 10);

  
    const user = await User.create({ username, password: hash });
    res.status(201).json({ message: "User registered.", userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials." });

   
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, userId: user._id, role: user.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
