const express = require("express");
const Question = require("../models/Question");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ── VOTE ON QUESTION ───────────────
router.post('/:id/vote', authMiddleware, async (req, res) => {
  const { voteType } = req.body; // 'upvote' or 'downvote'
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    if (voteType === 'upvote') {
      question.votes = (question.votes || 0) + 1;
    } else if (voteType === 'downvote') {
      question.votes = (question.votes || 0) - 1;
    } else {
      return res.status(400).json({ message: 'Invalid vote type.' });
    }
    await question.save();
    res.json({ votes: question.votes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── CREATE QUESTION ─────────────────── (Protected)
router.post("/", authMiddleware, async (req, res) => {
  const { title, description, tags } = req.body;
  try {
    const q = await Question.create({
      title,
      description,
      tags,
      authorId: req.user.id
    });
    res.status(201).json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET ALL QUESTIONS ──────────────────
router.get("/", async (req, res) => {
  try {
    const list = await Question.find()
      .populate("authorId", "username")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET SINGLE QUESTION ───────────────
router.get("/:id", async (req, res) => {
  try {
    const q = await Question.findById(req.params.id)
      .populate("authorId", "username");
    if (!q) return res.status(404).json({ message: "Not found." });
    res.json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
