const mongoose = require("mongoose");

const questionnaireSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patients",
      required: true,
    },
    assessmentMode: {
      type: String,
      enum: ['quick', 'detailed'],
      default: 'detailed',
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
      score: { type: Number },
      answers: [Number],
      severity: { type: String },
      completedAt: { type: Date, default: Date.now },
    },
    dass21: {
      depression: {
        score: { type: Number },
        severity: { type: String },
      },
      anxiety: {
        score: { type: Number },
        severity: { type: String },
      },
      stress: {
        score: { type: Number },
        severity: { type: String },
      },
      answers: [Number],
      completedAt: { type: Date, default: Date.now },
    },
    aiReport: {
      overallSummary: { type: String },
      depression: {
        analysis: { type: String },
        recommendations: [String],
        copingStrategies: [String],
      },
      anxiety: {
        analysis: { type: String },
        recommendations: [String],
        copingStrategies: [String],
      },
      stress: {
        analysis: { type: String },
        recommendations: [String],
        copingStrategies: [String],
      },
      nextSteps: [String],
      professionalHelpRecommended: { type: Boolean, default: false },
      generatedAt: { type: Date },
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

