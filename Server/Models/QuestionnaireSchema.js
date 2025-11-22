const mongoose = require("mongoose");

const questionnaireSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patients",
      required: true,
    },
    phq9: {
      score: { type: Number, required: true },
      answers: [Number],
      severity: { type: String, required: true },
      completedAt: { type: Date, default: Date.now },
    },
    gad7: {
      score: { type: Number, required: true },
      answers: [Number],
      severity: { type: String, required: true },
      completedAt: { type: Date, default: Date.now },
    },
    pss10: {
      score: { type: Number, required: true },
      answers: [Number],
      severity: { type: String, required: true },
      completedAt: { type: Date, default: Date.now },
    },
    dass21: {
      depression: {
        score: { type: Number, required: true },
        severity: { type: String, required: true },
      },
      anxiety: {
        score: { type: Number, required: true },
        severity: { type: String, required: true },
      },
      stress: {
        score: { type: Number, required: true },
        severity: { type: String, required: true },
      },
      answers: [Number],
      completedAt: { type: Date, default: Date.now },
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const QuestionnaireModel = mongoose.model("questionnaires", questionnaireSchema);

module.exports = QuestionnaireModel;

