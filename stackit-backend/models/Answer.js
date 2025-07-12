const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
  authorId:   { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },
  content:    { type: String, required: true },
  votes:      { type: Number, default: 0 },
  accepted:   { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Answer", answerSchema);
