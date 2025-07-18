
const express = require("express");
const Answer  = require("../models/Answer");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /?questionId=...  Fetch answers for a question
router.get("/", async (req, res) => {
  const { questionId } = req.query;
  if (!questionId) {
    return res.status(400).json({ error: "Missing questionId parameter." });
  }
  try {
    const answers = await Answer.find({ questionId })
      .populate("authorId", "username")
      .sort({ createdAt: 1 });
    res.json(answers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:questionId", authMiddleware, async (req, res) => {
  try {
    const a = await Answer.create({
      questionId: req.params.questionId,
      authorId:   req.user.id,
      content:    req.body.content,
    });

    // Notification logic
    try {
      const Question = require('../models/Question');
      const Notification = require('../models/Notification');
      const question = await Question.findById(req.params.questionId);
      if (question && String(question.authorId) !== String(req.user.id)) {
        // Only notify if the answerer is not the question author
        await Notification.create({
          user: question.authorId,
          question: question._id,
          answer: a._id,
          message: `Your question has a new answer!`,
        });
      }
    } catch (notifyErr) {
      // Log but don't block answer creation
      console.error('Notification error:', notifyErr);
    }

    res.status(201).json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/vote/:answerId", authMiddleware, async (req, res) => {
  const { delta } = req.body; // { delta: +1 } or { delta: -1 }
  try {
    const a = await Answer.findByIdAndUpdate(
      req.params.answerId,
      { $inc: { votes: delta } },
      { new: true }
    );
    res.json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/accept/:answerId", authMiddleware, async (req, res) => {
  try {
    // You may want to verify that req.user.id === question.authorId here
    const a = await Answer.findByIdAndUpdate(
      req.params.answerId,
      { accepted: true },
      { new: true }
    );
    res.json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
