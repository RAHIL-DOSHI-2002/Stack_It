const express = require("express");
const Answer  = require("../models/Answer");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/:questionId", authMiddleware, async (req, res) => {
  try {
    const a = await Answer.create({
      questionId: req.params.questionId,
      authorId:   req.user.id,
      content:    req.body.content,
    });
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
